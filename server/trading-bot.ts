import { storage } from "./storage";
import { priceService } from "./price-service";
import type { TradingStrategy } from "@shared/schema";

class TradingBot {
  private runningStrategies: Map<string, NodeJS.Timeout> = new Map();

  async startStrategy(strategyId: string) {
    const strategy = await storage.getStrategy(strategyId);
    if (!strategy || !strategy.isActive) return;

    // Don't start if already running
    if (this.runningStrategies.has(strategyId)) return;

    console.log(`Starting trading bot for strategy: ${strategy.name}`);

    // Run strategy logic every 30 seconds
    const interval = setInterval(async () => {
      // Re-fetch strategy to get latest state
      const latestStrategy = await storage.getStrategy(strategyId);
      if (!latestStrategy || !latestStrategy.isActive) {
        this.stopStrategy(strategyId);
        return;
      }
      await this.executeStrategy(latestStrategy);
    }, 30000);

    this.runningStrategies.set(strategyId, interval);
  }

  async stopStrategy(strategyId: string) {
    const interval = this.runningStrategies.get(strategyId);
    if (interval) {
      clearInterval(interval);
      this.runningStrategies.delete(strategyId);
      console.log(`Stopped trading bot for strategy: ${strategyId}`);
    }
  }

  private async executeStrategy(strategy: TradingStrategy) {
    const currentPrice = priceService.getCurrentPrice();
    if (!currentPrice) return;

    const portfolio = await storage.getPortfolio(strategy.userId);
    if (!portfolio) return;

    // Route to appropriate strategy implementation
    if (strategy.type === 'grid-trading') {
      await this.executeGridTrading(strategy, currentPrice.price, portfolio);
    } else if (strategy.type === 'traditional-grid') {
      await this.executeTraditionalGrid(strategy, currentPrice.price, portfolio);
    } else {
      await this.executeDefaultStrategy(strategy, currentPrice.price, portfolio);
    }
  }

  private async executeDefaultStrategy(strategy: TradingStrategy, currentPrice: number, portfolio: any) {
    // Simple strategy: buy if we have USD, sell if we have BTC
    // This is a basic paper trading simulation
    const shouldBuy = this.shouldBuy(strategy, currentPrice);
    const shouldSell = this.shouldSell(strategy, currentPrice);

    const tradeSizePercent = strategy.tradeSize / 100;

    if (shouldBuy && parseFloat(portfolio.usdBalance) > 100) {
      // Calculate trade amount
      const usdToSpend = parseFloat(portfolio.usdBalance) * tradeSizePercent;
      const btcAmount = usdToSpend / currentPrice;

      // Create buy transaction
      await storage.createTransaction({
        userId: strategy.userId,
        strategyId: strategy.id,
        type: 'buy',
        amount: btcAmount.toString(),
        price: currentPrice.toString(),
        total: usdToSpend.toString(),
        status: 'completed',
      });

      // Update portfolio
      await storage.updatePortfolio(strategy.userId, {
        btcBalance: (parseFloat(portfolio.btcBalance) + btcAmount).toString(),
        usdBalance: (parseFloat(portfolio.usdBalance) - usdToSpend).toString(),
      });

      console.log(`Executed BUY: ${btcAmount.toFixed(8)} BTC at $${currentPrice}`);
    } else if (shouldSell && parseFloat(portfolio.btcBalance) > 0.0001) {
      // Calculate sell amount
      const btcToSell = parseFloat(portfolio.btcBalance) * tradeSizePercent;
      const usdReceived = btcToSell * currentPrice;

      // Create sell transaction
      await storage.createTransaction({
        userId: strategy.userId,
        strategyId: strategy.id,
        type: 'sell',
        amount: btcToSell.toString(),
        price: currentPrice.toString(),
        total: usdReceived.toString(),
        status: 'completed',
      });

      // Update portfolio
      await storage.updatePortfolio(strategy.userId, {
        btcBalance: (parseFloat(portfolio.btcBalance) - btcToSell).toString(),
        usdBalance: (parseFloat(portfolio.usdBalance) + usdReceived).toString(),
      });

      console.log(`Executed SELL: ${btcToSell.toFixed(8)} BTC at $${currentPrice}`);
    }
  }

  private async executeGridTrading(strategy: TradingStrategy, currentPrice: number, portfolio: any) {
    // Initialize strategy state on first run
    let state = strategy.strategyState as { initialPrice?: number; gridOrders?: Array<{ buyPrice: number; sellPrice: number; btcAmount: number; filled: boolean }> } | null;
    
    if (!state || !state.initialPrice) {
      // First run: record initial price
      state = {
        initialPrice: currentPrice,
        gridOrders: [],
      };
      
      await storage.updateStrategy(strategy.id, { strategyState: state });
      console.log(`Grid Trading initialized at $${currentPrice.toFixed(2)}`);
      return;
    }

    const gridInterval = parseFloat(strategy.gridInterval || "2000");
    const profitPercent = parseFloat(strategy.gridProfitPercent || "5.0");
    const tradeSizePercent = strategy.tradeSize / 100;
    const initialPrice = state.initialPrice!;
    const gridOrders = state.gridOrders || [];
    
    // Validate grid interval
    if (gridInterval <= 0) {
      console.log('Grid Trading: Invalid grid interval (must be positive), skipping');
      return;
    }

    // Calculate which grid level we're at (how many $2000 dips below initial)
    const priceDrop = initialPrice - currentPrice;
    const gridLevel = Math.floor(priceDrop / gridInterval);

    // Check for buy opportunities at grid levels
    if (gridLevel > 0) {
      // Calculate the buy price for this grid level
      const targetBuyPrice = initialPrice - (gridLevel * gridInterval);
      
      // Check if we already have an order at this level
      const existingOrder = gridOrders.find(order => 
        Math.abs(order.buyPrice - targetBuyPrice) < 1 // within $1
      );

      // Place buy order if we're at or below the grid level and don't have an existing order
      if (!existingOrder && currentPrice <= targetBuyPrice && parseFloat(portfolio.usdBalance) > 100) {
        const usdToSpend = parseFloat(portfolio.usdBalance) * tradeSizePercent;
        const btcAmount = usdToSpend / currentPrice;
        const sellPrice = currentPrice * (1 + profitPercent / 100);

        // Create buy transaction
        await storage.createTransaction({
          userId: strategy.userId,
          strategyId: strategy.id,
          type: 'buy',
          amount: btcAmount.toString(),
          price: currentPrice.toString(),
          total: usdToSpend.toString(),
          status: 'completed',
        });

        // Update portfolio
        await storage.updatePortfolio(strategy.userId, {
          btcBalance: (parseFloat(portfolio.btcBalance) + btcAmount).toString(),
          usdBalance: (parseFloat(portfolio.usdBalance) - usdToSpend).toString(),
        });

        // Add paired sell order to grid
        gridOrders.push({
          buyPrice: currentPrice,
          sellPrice: sellPrice,
          btcAmount: btcAmount,
          filled: false,
        });

        await storage.updateStrategy(strategy.id, { strategyState: { ...state, gridOrders } });

        console.log(`Grid Trading BUY: ${btcAmount.toFixed(8)} BTC at $${currentPrice.toFixed(2)} (Grid level ${gridLevel}) - Paired sell at $${sellPrice.toFixed(2)}`);
      }
    }

    // Check for sell opportunities (5% profit from buy price)
    for (let i = 0; i < gridOrders.length; i++) {
      const order = gridOrders[i];
      
      if (!order.filled && currentPrice >= order.sellPrice && parseFloat(portfolio.btcBalance) >= order.btcAmount) {
        // Execute sell order
        const usdReceived = order.btcAmount * currentPrice;

        await storage.createTransaction({
          userId: strategy.userId,
          strategyId: strategy.id,
          type: 'sell',
          amount: order.btcAmount.toString(),
          price: currentPrice.toString(),
          total: usdReceived.toString(),
          status: 'completed',
        });

        // Update portfolio
        await storage.updatePortfolio(strategy.userId, {
          btcBalance: (parseFloat(portfolio.btcBalance) - order.btcAmount).toString(),
          usdBalance: (parseFloat(portfolio.usdBalance) + usdReceived).toString(),
        });

        // Mark order as filled
        gridOrders[i].filled = true;
        await storage.updateStrategy(strategy.id, { strategyState: { ...state, gridOrders } });

        const profit = usdReceived - (order.btcAmount * order.buyPrice);
        console.log(`Grid Trading SELL: ${order.btcAmount.toFixed(8)} BTC at $${currentPrice.toFixed(2)} (Profit: $${profit.toFixed(2)})`);
      }
    }
  }

  private async executeTraditionalGrid(strategy: TradingStrategy, currentPrice: number, portfolio: any) {
    // Traditional bidirectional grid trading
    let state = strategy.strategyState as { 
      gridLevels?: Array<{ price: number; hasBuyOrder: boolean; hasSellOrder: boolean }>;
      activeOrders?: Array<{ id: string; type: 'buy' | 'sell'; price: number; btcAmount: number; gridLevel: number; filled: boolean }>;
    } | null;

    const lowerBound = parseFloat(strategy.gridLowerBound || "0");
    const upperBound = parseFloat(strategy.gridUpperBound || "0");
    const gridInterval = parseFloat(strategy.gridInterval || "2000");
    const tradeSizePercent = strategy.tradeSize / 100;

    // Validate bounds and interval
    if (lowerBound <= 0 || upperBound <= 0 || lowerBound >= upperBound) {
      console.log('Traditional Grid: Invalid bounds, skipping');
      return;
    }
    
    if (gridInterval <= 0) {
      console.log('Traditional Grid: Invalid grid interval (must be positive), skipping');
      return;
    }

    // Initialize grid on first run
    if (!state || !state.gridLevels) {
      const gridLevels: Array<{ price: number; hasBuyOrder: boolean; hasSellOrder: boolean }> = [];
      let price = lowerBound;
      
      while (price <= upperBound) {
        gridLevels.push({ price, hasBuyOrder: false, hasSellOrder: false });
        price += gridInterval;
      }

      state = {
        gridLevels,
        activeOrders: [],
      };

      await storage.updateStrategy(strategy.id, { strategyState: state });
      console.log(`Traditional Grid initialized: ${gridLevels.length} levels from $${lowerBound} to $${upperBound}`);
      return;
    }

    const gridLevels = state.gridLevels!;
    const activeOrders = state.activeOrders || [];
    let ordersChanged = false;

    // Find current grid level
    let currentLevel = -1;
    for (let i = 0; i < gridLevels.length; i++) {
      if (currentPrice >= gridLevels[i].price && (i === gridLevels.length - 1 || currentPrice < gridLevels[i + 1].price)) {
        currentLevel = i;
        break;
      }
    }

    if (currentLevel === -1) {
      console.log(`Traditional Grid: Price $${currentPrice} is outside grid bounds`);
      return;
    }

    // Place buy orders at levels BELOW current price (if we have USD)
    if (parseFloat(portfolio.usdBalance) > 100) {
      for (let i = 0; i < currentLevel; i++) {
        const level = gridLevels[i];
        
        // Check if we already have a buy order at this level
        const existingBuyOrder = activeOrders.find(
          order => order.type === 'buy' && order.gridLevel === i && !order.filled
        );

        if (!existingBuyOrder) {
          const usdToSpend = parseFloat(portfolio.usdBalance) * tradeSizePercent;
          const btcAmount = usdToSpend / level.price;

          activeOrders.push({
            id: `buy-${i}-${Date.now()}`,
            type: 'buy',
            price: level.price,
            btcAmount,
            gridLevel: i,
            filled: false,
          });

          gridLevels[i].hasBuyOrder = true;
          ordersChanged = true;
          console.log(`Traditional Grid: Placed BUY order at $${level.price.toFixed(2)} (Level ${i})`);
        }
      }
    }

    // Place sell orders at levels ABOVE current price (if we have BTC)
    if (parseFloat(portfolio.btcBalance) > 0.0001) {
      for (let i = currentLevel + 1; i < gridLevels.length; i++) {
        const level = gridLevels[i];
        
        // Check if we already have a sell order at this level
        const existingSellOrder = activeOrders.find(
          order => order.type === 'sell' && order.gridLevel === i && !order.filled
        );

        if (!existingSellOrder) {
          const btcToSell = parseFloat(portfolio.btcBalance) * tradeSizePercent;

          activeOrders.push({
            id: `sell-${i}-${Date.now()}`,
            type: 'sell',
            price: level.price,
            btcAmount: btcToSell,
            gridLevel: i,
            filled: false,
          });

          gridLevels[i].hasSellOrder = true;
          ordersChanged = true;
          console.log(`Traditional Grid: Placed SELL order at $${level.price.toFixed(2)} (Level ${i})`);
        }
      }
    }

    // Execute orders when price crosses levels
    for (let i = 0; i < activeOrders.length; i++) {
      const order = activeOrders[i];
      
      if (order.filled) continue;

      // Execute buy orders when price drops to or below the order price
      if (order.type === 'buy' && currentPrice <= order.price && parseFloat(portfolio.usdBalance) >= (order.btcAmount * order.price)) {
        const usdToSpend = order.btcAmount * order.price;

        await storage.createTransaction({
          userId: strategy.userId,
          strategyId: strategy.id,
          type: 'buy',
          amount: order.btcAmount.toString(),
          price: order.price.toString(),
          total: usdToSpend.toString(),
          status: 'completed',
        });

        await storage.updatePortfolio(strategy.userId, {
          btcBalance: (parseFloat(portfolio.btcBalance) + order.btcAmount).toString(),
          usdBalance: (parseFloat(portfolio.usdBalance) - usdToSpend).toString(),
        });

        activeOrders[i].filled = true;
        ordersChanged = true;
        console.log(`Traditional Grid EXECUTED BUY: ${order.btcAmount.toFixed(8)} BTC at $${order.price.toFixed(2)} (Level ${order.gridLevel})`);
      }

      // Execute sell orders when price rises to or above the order price
      if (order.type === 'sell' && currentPrice >= order.price && parseFloat(portfolio.btcBalance) >= order.btcAmount) {
        const usdReceived = order.btcAmount * order.price;

        await storage.createTransaction({
          userId: strategy.userId,
          strategyId: strategy.id,
          type: 'sell',
          amount: order.btcAmount.toString(),
          price: order.price.toString(),
          total: usdReceived.toString(),
          status: 'completed',
        });

        await storage.updatePortfolio(strategy.userId, {
          btcBalance: (parseFloat(portfolio.btcBalance) - order.btcAmount).toString(),
          usdBalance: (parseFloat(portfolio.usdBalance) + usdReceived).toString(),
        });

        activeOrders[i].filled = true;
        ordersChanged = true;
        console.log(`Traditional Grid EXECUTED SELL: ${order.btcAmount.toFixed(8)} BTC at $${order.price.toFixed(2)} (Level ${order.gridLevel})`);
      }
    }

    // Update state if orders changed
    if (ordersChanged) {
      await storage.updateStrategy(strategy.id, { 
        strategyState: { gridLevels, activeOrders } 
      });
    }
  }

  private shouldBuy(strategy: TradingStrategy, currentPrice: number): boolean {
    // Simple logic: random buy signal based on risk tolerance
    // In a real implementation, this would use technical indicators
    const buyProbability = strategy.riskTolerance / 200; // 0-50%
    return Math.random() < buyProbability;
  }

  private shouldSell(strategy: TradingStrategy, currentPrice: number): boolean {
    // Simple logic: random sell signal based on risk tolerance
    const sellProbability = strategy.riskTolerance / 200;
    return Math.random() < sellProbability;
  }

  async syncAllActiveStrategies() {
    // This would be called on server startup to resume all active strategies
    // For now, we'll implement this when needed
  }
}

export const tradingBot = new TradingBot();
