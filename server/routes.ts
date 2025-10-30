import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { priceService } from "./price-service";
import { tradingBot } from "./trading-bot";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertStrategySchema, 
  insertTransactionSchema,
  insertPriceAlertSchema,
  insertExchangeCredentialSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Start price updates
  priceService.startPriceUpdates();

  // Price endpoints
  app.get("/api/price/current", async (req, res) => {
    const price = priceService.getCurrentPrice();
    if (!price) {
      await priceService.fetchPrice();
      const newPrice = priceService.getCurrentPrice();
      return res.json({ ...newPrice, exchange: priceService.getActiveExchange() });
    }
    res.json({ ...price, exchange: priceService.getActiveExchange() });
  });

  app.get("/api/price/historical", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 90;
      const historicalData = await priceService.fetchHistoricalPrices(days);
      res.json(historicalData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/price/chart", async (req, res) => {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
      const historicalData = await priceService.fetchHistoricalPrices(Math.ceil(hours / 24));
      
      // Sample the data based on timeframe
      const now = Date.now();
      const cutoffTime = now - (hours * 3600000);
      const filtered = historicalData.filter(d => d.timestamp >= cutoffTime);
      
      // Format for chart
      const chartData = filtered.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: d.price,
        timestamp: d.timestamp
      }));
      
      res.json(chartData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Portfolio endpoints
  app.get("/api/portfolio", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    let portfolio = await storage.getPortfolio(userId);
    if (!portfolio) {
      portfolio = await storage.createPortfolio({
        userId,
        btcBalance: "0",
        usdBalance: "100000",
      });
    }
    
    res.json(portfolio);
  });

  // Strategy endpoints
  app.get("/api/strategies", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const strategies = await storage.getStrategies(userId);
    res.json(strategies);
  });

  app.post("/api/strategies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertStrategySchema.parse({ ...req.body, userId });
      const strategy = await storage.createStrategy(validated);
      res.json(strategy);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/strategies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateStrategy(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Strategy not found" });
      }

      // If strategy is activated, start the bot
      if (req.body.isActive === true) {
        await tradingBot.startStrategy(id);
      } else if (req.body.isActive === false) {
        await tradingBot.stopStrategy(id);
      }

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/strategies/:id", isAuthenticated, async (req: any, res) => {
    const { id } = req.params;
    
    // Stop the bot if running
    await tradingBot.stopStrategy(id);
    
    const deleted = await storage.deleteStrategy(id);
    if (!deleted) {
      return res.status(404).json({ error: "Strategy not found" });
    }
    
    res.json({ success: true });
  });

  // Transaction endpoints
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const transactions = await storage.getTransactions(userId, limit);
    res.json(transactions);
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertTransactionSchema.parse({ ...req.body, userId });
      const transaction = await storage.createTransaction(validated);
      
      // Update portfolio
      const portfolio = await storage.getPortfolio(userId);
      if (portfolio) {
        const currentPrice = parseFloat(validated.price);
        const amount = parseFloat(validated.amount);
        
        if (validated.type === 'buy') {
          await storage.updatePortfolio(userId, {
            btcBalance: (parseFloat(portfolio.btcBalance) + amount).toString(),
            usdBalance: (parseFloat(portfolio.usdBalance) - (amount * currentPrice)).toString(),
          });
        } else {
          await storage.updatePortfolio(userId, {
            btcBalance: (parseFloat(portfolio.btcBalance) - amount).toString(),
            usdBalance: (parseFloat(portfolio.usdBalance) + (amount * currentPrice)).toString(),
          });
        }
      }
      
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Alert endpoints
  app.get("/api/alerts", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const alerts = await storage.getAlerts(userId);
    res.json(alerts);
  });

  app.post("/api/alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPriceAlertSchema.parse({ ...req.body, userId });
      const alert = await storage.createAlert(validated);
      res.json(alert);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/alerts/:id", isAuthenticated, async (req: any, res) => {
    const { id } = req.params;
    const updated = await storage.updateAlert(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ error: "Alert not found" });
    }
    
    res.json(updated);
  });

  app.delete("/api/alerts/:id", isAuthenticated, async (req: any, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteAlert(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Alert not found" });
    }
    
    res.json({ success: true });
  });

  // Exchange credentials endpoints
  app.get("/api/exchange-credentials", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const credentials = await storage.getExchangeCredentials(userId);
    res.json(credentials);
  });

  app.post("/api/exchange-credentials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertExchangeCredentialSchema.parse({ ...req.body, userId });
      const credential = await storage.createExchangeCredential(validated);
      res.json(credential);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/exchange-credentials/:id", isAuthenticated, async (req: any, res) => {
    const { id } = req.params;
    const updated = await storage.updateExchangeCredential(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ error: "Credential not found" });
    }
    
    res.json(updated);
  });

  app.delete("/api/exchange-credentials/:id", isAuthenticated, async (req: any, res) => {
    const { id } = req.params;
    const deleted = await storage.deleteExchangeCredential(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Credential not found" });
    }
    
    res.json({ success: true });
  });

  // Notification settings endpoints
  app.get("/api/notification-settings", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    let settings = await storage.getNotificationSettings(userId);
    
    if (!settings) {
      settings = await storage.createNotificationSettings({
        userId,
        telegram: null,
        whatsapp: null,
        sms: null,
        alertTypes: {
          priceAlerts: true,
          tradeExecutions: true,
          botStatus: true,
          dailySummary: false,
        },
      });
    }
    
    res.json(settings);
  });

  app.patch("/api/notification-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updated = await storage.updateNotificationSettings(userId, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Statistics endpoint
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const portfolio = await storage.getPortfolio(userId);
    const transactions = await storage.getTransactions(userId);
    const strategies = await storage.getStrategies(userId);
    const activeStrategy = strategies.find(s => s.isActive);

    // Calculate stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactions.filter(
      t => t.timestamp >= todayStart
    );

    const totalTrades = transactions.length;
    const tradesToday = todayTransactions.length;
    
    // Simple success rate calculation (buy low, sell high)
    let successfulTrades = 0;
    for (let i = 0; i < transactions.length - 1; i++) {
      const current = transactions[i];
      const next = transactions[i + 1];
      if (current.type === 'buy' && next.type === 'sell' && 
          parseFloat(next.price) > parseFloat(current.price)) {
        successfulTrades++;
      }
    }
    
    const successRate = totalTrades > 1 ? (successfulTrades / (totalTrades / 2)) * 100 : 0;

    // Calculate P/L
    const currentPrice = priceService.getCurrentPrice()?.price || 67842.50;
    const portfolioValue = portfolio 
      ? parseFloat(portfolio.usdBalance) + (parseFloat(portfolio.btcBalance) * currentPrice)
      : 100000;
    
    const totalPL = portfolioValue - 100000;
    
    // Today's P/L (simplified)
    const todayPL = todayTransactions.reduce((sum, tx) => {
      const total = parseFloat(tx.total);
      return tx.type === 'sell' ? sum + total : sum - total;
    }, 0);

    res.json({
      portfolio: {
        totalValue: portfolioValue,
        todayPL,
        totalPL,
        btcBalance: portfolio?.btcBalance || "0",
      },
      bot: {
        isActive: !!activeStrategy,
        strategyName: activeStrategy?.name || "No active strategy",
        tradesToday,
        successRate: Math.round(successRate),
        activePositions: parseFloat(portfolio?.btcBalance || "0") > 0 ? 1 : 0,
      },
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
