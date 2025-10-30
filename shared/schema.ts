import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tradingStrategies = pgTable("trading_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'ma-crossover', 'rsi', 'macd', 'bollinger'
  isActive: boolean("is_active").notNull().default(false),
  riskTolerance: integer("risk_tolerance").notNull().default(50), // 0-100
  tradeSize: integer("trade_size").notNull().default(25), // percentage
  stopLoss: decimal("stop_loss", { precision: 5, scale: 2 }).notNull().default("2.5"),
  takeProfit: decimal("take_profit", { precision: 5, scale: 2 }).notNull().default("5.0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  strategyId: varchar("strategy_id").references(() => tradingStrategies.id, { onDelete: "set null" }),
  type: text("type").notNull(), // 'buy' or 'sell'
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(), // BTC amount
  price: decimal("price", { precision: 12, scale: 2 }).notNull(), // USD price
  total: decimal("total", { precision: 12, scale: 2 }).notNull(), // USD total
  status: text("status").notNull().default("completed"), // 'completed' or 'pending'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const portfolio = pgTable("portfolio", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  btcBalance: decimal("btc_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  usdBalance: decimal("usd_balance", { precision: 12, scale: 2 }).notNull().default("100000"), // Starting with $100k paper money
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetPrice: decimal("target_price", { precision: 12, scale: 2 }).notNull(),
  condition: text("condition").notNull(), // 'above' or 'below'
  isActive: boolean("is_active").notNull().default(true),
  triggered: boolean("triggered").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exchangeCredentials = pgTable("exchange_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exchange: text("exchange").notNull(), // 'binance', 'bitget', etc.
  apiKey: text("api_key").notNull(),
  secretKey: text("secret_key").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  telegram: jsonb("telegram").$type<{ enabled: boolean; botToken?: string; chatId?: string }>(),
  whatsapp: jsonb("whatsapp").$type<{ enabled: boolean; number?: string }>(),
  sms: jsonb("sms").$type<{ enabled: boolean; number?: string }>(),
  alertTypes: jsonb("alert_types").$type<{
    priceAlerts: boolean;
    tradeExecutions: boolean;
    botStatus: boolean;
    dailySummary: boolean;
  }>().notNull().default({
    priceAlerts: true,
    tradeExecutions: true,
    botStatus: true,
    dailySummary: false,
  }),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertStrategySchema = createInsertSchema(tradingStrategies).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });
export const insertPortfolioSchema = createInsertSchema(portfolio).omit({ id: true, updatedAt: true });
export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true });
export const insertExchangeCredentialSchema = createInsertSchema(exchangeCredentials).omit({ id: true, createdAt: true });
export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;

export type ExchangeCredential = typeof exchangeCredentials.$inferSelect;
export type InsertExchangeCredential = z.infer<typeof insertExchangeCredentialSchema>;

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
