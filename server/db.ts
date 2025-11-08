import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if running locally (not on Replit)
const isLocalDevelopment = !process.env.REPL_ID && !process.env.REPLIT_DEPLOYMENT;

// Initialize database connection based on environment
async function initializeDatabase() {
  if (isLocalDevelopment) {
    // Use regular PostgreSQL driver for local development
    console.log("🔧 Using local PostgreSQL driver (pg)");
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });
    return { db, pool };
  } else {
    // Use Neon serverless driver for Replit/cloud
    console.log("☁️  Using Neon serverless driver");
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const ws = await import('ws');
    
    neonConfig.webSocketConstructor = ws.default;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });
    return { db, pool };
  }
}

// Initialize and export
const dbPromise = initializeDatabase();
export const db = (await dbPromise).db;
export const pool = (await dbPromise).pool;
