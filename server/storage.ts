import { 
  type User, type InsertUser,
  type TradingStrategy, type InsertStrategy,
  type Transaction, type InsertTransaction,
  type Portfolio, type InsertPortfolio,
  type PriceAlert, type InsertPriceAlert,
  type ExchangeCredential, type InsertExchangeCredential,
  type NotificationSettings, type InsertNotificationSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Portfolio
  getPortfolio(userId: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(userId: string, updates: Partial<Portfolio>): Promise<Portfolio | undefined>;

  // Trading Strategies
  getStrategies(userId: string): Promise<TradingStrategy[]>;
  getStrategy(id: string): Promise<TradingStrategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<TradingStrategy>;
  updateStrategy(id: string, updates: Partial<TradingStrategy>): Promise<TradingStrategy | undefined>;
  deleteStrategy(id: string): Promise<boolean>;

  // Transactions
  getTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Price Alerts
  getAlerts(userId: string): Promise<PriceAlert[]>;
  createAlert(alert: InsertPriceAlert): Promise<PriceAlert>;
  updateAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert | undefined>;
  deleteAlert(id: string): Promise<boolean>;

  // Exchange Credentials
  getExchangeCredentials(userId: string): Promise<ExchangeCredential[]>;
  createExchangeCredential(credential: InsertExchangeCredential): Promise<ExchangeCredential>;
  updateExchangeCredential(id: string, updates: Partial<ExchangeCredential>): Promise<ExchangeCredential | undefined>;
  deleteExchangeCredential(id: string): Promise<boolean>;

  // Notification Settings
  getNotificationSettings(userId: string): Promise<NotificationSettings | undefined>;
  createNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings>;
  updateNotificationSettings(userId: string, updates: Partial<NotificationSettings>): Promise<NotificationSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private portfolios: Map<string, Portfolio>;
  private strategies: Map<string, TradingStrategy>;
  private transactions: Map<string, Transaction>;
  private alerts: Map<string, PriceAlert>;
  private credentials: Map<string, ExchangeCredential>;
  private notificationSettings: Map<string, NotificationSettings>;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.strategies = new Map();
    this.transactions = new Map();
    this.alerts = new Map();
    this.credentials = new Map();
    this.notificationSettings = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create default portfolio
    await this.createPortfolio({
      userId: id,
      btcBalance: "0",
      usdBalance: "100000",
    });
    
    return user;
  }

  // Portfolio methods
  async getPortfolio(userId: string): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(p => p.userId === userId);
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const id = randomUUID();
    const newPortfolio: Portfolio = { 
      id,
      userId: portfolio.userId,
      btcBalance: portfolio.btcBalance || "0",
      usdBalance: portfolio.usdBalance || "100000",
      updatedAt: new Date()
    };
    this.portfolios.set(id, newPortfolio);
    return newPortfolio;
  }

  async updatePortfolio(userId: string, updates: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) return undefined;
    
    const updated: Portfolio = { 
      ...portfolio, 
      ...updates,
      updatedAt: new Date()
    };
    this.portfolios.set(portfolio.id, updated);
    return updated;
  }

  // Strategy methods
  async getStrategies(userId: string): Promise<TradingStrategy[]> {
    return Array.from(this.strategies.values()).filter(s => s.userId === userId);
  }

  async getStrategy(id: string): Promise<TradingStrategy | undefined> {
    return this.strategies.get(id);
  }

  async createStrategy(strategy: InsertStrategy): Promise<TradingStrategy> {
    const id = randomUUID();
    const newStrategy: TradingStrategy = { 
      id,
      userId: strategy.userId,
      name: strategy.name,
      type: strategy.type,
      isActive: strategy.isActive ?? false,
      riskTolerance: strategy.riskTolerance ?? 50,
      tradeSize: strategy.tradeSize ?? 25,
      stopLoss: strategy.stopLoss ?? "2.5",
      takeProfit: strategy.takeProfit ?? "5.0",
      createdAt: new Date()
    };
    this.strategies.set(id, newStrategy);
    return newStrategy;
  }

  async updateStrategy(id: string, updates: Partial<TradingStrategy>): Promise<TradingStrategy | undefined> {
    const strategy = this.strategies.get(id);
    if (!strategy) return undefined;
    
    const updated: TradingStrategy = { ...strategy, ...updates };
    this.strategies.set(id, updated);
    return updated;
  }

  async deleteStrategy(id: string): Promise<boolean> {
    return this.strategies.delete(id);
  }

  // Transaction methods
  async getTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    const userTxs = Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? userTxs.slice(0, limit) : userTxs;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTx: Transaction = { 
      id,
      userId: transaction.userId,
      strategyId: transaction.strategyId ?? null,
      type: transaction.type,
      amount: transaction.amount,
      price: transaction.price,
      total: transaction.total,
      status: transaction.status ?? "completed",
      timestamp: new Date()
    };
    this.transactions.set(id, newTx);
    return newTx;
  }

  // Alert methods
  async getAlerts(userId: string): Promise<PriceAlert[]> {
    return Array.from(this.alerts.values()).filter(a => a.userId === userId);
  }

  async createAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const id = randomUUID();
    const newAlert: PriceAlert = { 
      id,
      userId: alert.userId,
      targetPrice: alert.targetPrice,
      condition: alert.condition,
      isActive: alert.isActive ?? true,
      triggered: alert.triggered ?? false,
      createdAt: new Date()
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updated: PriceAlert = { ...alert, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.alerts.delete(id);
  }

  // Exchange credential methods
  async getExchangeCredentials(userId: string): Promise<ExchangeCredential[]> {
    return Array.from(this.credentials.values()).filter(c => c.userId === userId);
  }

  async createExchangeCredential(credential: InsertExchangeCredential): Promise<ExchangeCredential> {
    const id = randomUUID();
    const newCred: ExchangeCredential = { 
      id,
      userId: credential.userId,
      exchange: credential.exchange,
      apiKey: credential.apiKey,
      secretKey: credential.secretKey,
      isActive: credential.isActive ?? false,
      createdAt: new Date()
    };
    this.credentials.set(id, newCred);
    return newCred;
  }

  async updateExchangeCredential(id: string, updates: Partial<ExchangeCredential>): Promise<ExchangeCredential | undefined> {
    const credential = this.credentials.get(id);
    if (!credential) return undefined;
    
    const updated: ExchangeCredential = { ...credential, ...updates };
    this.credentials.set(id, updated);
    return updated;
  }

  async deleteExchangeCredential(id: string): Promise<boolean> {
    return this.credentials.delete(id);
  }

  // Notification settings methods
  async getNotificationSettings(userId: string): Promise<NotificationSettings | undefined> {
    return Array.from(this.notificationSettings.values()).find(n => n.userId === userId);
  }

  async createNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings> {
    const id = randomUUID();
    const newSettings: NotificationSettings = { 
      id,
      userId: settings.userId,
      telegram: settings.telegram ?? null,
      whatsapp: settings.whatsapp ?? null,
      sms: settings.sms ?? null,
      alertTypes: settings.alertTypes ?? {
        priceAlerts: true,
        tradeExecutions: true,
        botStatus: true,
        dailySummary: false,
      }
    };
    this.notificationSettings.set(id, newSettings);
    return newSettings;
  }

  async updateNotificationSettings(userId: string, updates: Partial<NotificationSettings>): Promise<NotificationSettings | undefined> {
    const settings = await this.getNotificationSettings(userId);
    if (!settings) return undefined;
    
    const updated: NotificationSettings = { ...settings, ...updates };
    this.notificationSettings.set(settings.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
