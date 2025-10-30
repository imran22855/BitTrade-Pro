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
      await this.executeStrategy(strategy);
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

    // Simple strategy: buy if we have USD, sell if we have BTC
    // This is a basic paper trading simulation
    const shouldBuy = this.shouldBuy(strategy, currentPrice.price);
    const shouldSell = this.shouldSell(strategy, currentPrice.price);

    const tradeSizePercent = strategy.tradeSize / 100;

    if (shouldBuy && parseFloat(portfolio.usdBalance) > 100) {
      // Calculate trade amount
      const usdToSpend = parseFloat(portfolio.usdBalance) * tradeSizePercent;
      const btcAmount = usdToSpend / currentPrice.price;

      // Create buy transaction
      await storage.createTransaction({
        userId: strategy.userId,
        strategyId: strategy.id,
        type: 'buy',
        amount: btcAmount.toString(),
        price: currentPrice.price.toString(),
        total: usdToSpend.toString(),
        status: 'completed',
      });

      // Update portfolio
      await storage.updatePortfolio(strategy.userId, {
        btcBalance: (parseFloat(portfolio.btcBalance) + btcAmount).toString(),
        usdBalance: (parseFloat(portfolio.usdBalance) - usdToSpend).toString(),
      });

      console.log(`Executed BUY: ${btcAmount.toFixed(8)} BTC at $${currentPrice.price}`);
    } else if (shouldSell && parseFloat(portfolio.btcBalance) > 0.0001) {
      // Calculate sell amount
      const btcToSell = parseFloat(portfolio.btcBalance) * tradeSizePercent;
      const usdReceived = btcToSell * currentPrice.price;

      // Create sell transaction
      await storage.createTransaction({
        userId: strategy.userId,
        strategyId: strategy.id,
        type: 'sell',
        amount: btcToSell.toString(),
        price: currentPrice.price.toString(),
        total: usdReceived.toString(),
        status: 'completed',
      });

      // Update portfolio
      await storage.updatePortfolio(strategy.userId, {
        btcBalance: (parseFloat(portfolio.btcBalance) - btcToSell).toString(),
        usdBalance: (parseFloat(portfolio.usdBalance) + usdReceived).toString(),
      });

      console.log(`Executed SELL: ${btcToSell.toFixed(8)} BTC at $${currentPrice.price}`);
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
