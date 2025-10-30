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
