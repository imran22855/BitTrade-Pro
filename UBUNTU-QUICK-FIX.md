# Ubuntu Quick Fix - Database Connection Issue

## Problem Fixed

Your app was trying to use Neon's WebSocket driver (`@neondatabase/serverless`) which only works with Neon cloud databases. Your local Ubuntu PostgreSQL doesn't support WebSocket connections.

## Solution Applied

The app now **automatically detects** where it's running and uses the correct database driver:

- 🔧 **Local Ubuntu:** Uses regular `pg` driver for PostgreSQL
- ☁️ **Replit:** Uses Neon serverless driver with WebSocket

---

## Steps to Run on Your Ubuntu Machine

### 1. Push Changes from Replit

Open the **Shell** in Replit and run:

```bash
git add -A
git commit -m "Add local development mode and Ubuntu PostgreSQL support"
git push origin main
```

Enter your credentials when prompted:
- **Username:** `imran22855`
- **Password:** Your GitHub Personal Access Token

### 2. Pull Changes on Ubuntu

On your Ubuntu machine:

```bash
cd ~/BitTrade-Pro
git pull origin main
```

### 3. Install the `pg` Package

The app needs the PostgreSQL driver for local development:

```bash
npm install pg
```

This installs the regular PostgreSQL driver that works with your local database.

### 4. Run the App

```bash
npm run dev
```

You should see:

```
🔧 Running in LOCAL DEVELOPMENT mode - Auth disabled
📝 Using mock user session for testing
🔧 Using local PostgreSQL driver (pg)
✅ Mock user created: dev@localhost.com
Server running on http://0.0.0.0:5000
```

### 5. Test It!

Open your browser:
```
http://localhost:5000
```

You'll be automatically logged in as the mock user!

---

## What Changed

### Modified Files:
1. ✏️ **`server/db.ts`** - Auto-detects environment and uses correct DB driver
2. ✏️ **`server/replitAuth.ts`** - Bypasses Replit Auth when running locally
3. ✨ **`setup-ubuntu.sh`** - Automated Ubuntu setup script (updated)

### How It Works:

The app checks if `REPL_ID` environment variable exists:

- **Not found** (Local Ubuntu): 
  - Uses `pg` driver
  - Creates mock user session
  - Disables Replit Auth
  
- **Found** (Replit):
  - Uses Neon WebSocket driver
  - Requires Replit Auth login
  - Normal production mode

---

## Testing Binance API

After the app starts successfully, you can test your Binance credentials:

1. **Open http://localhost:5000**
2. **Go to Settings → Exchange Credentials**
3. **Add Binance credentials:**
   - Exchange: Binance
   - API Key: Your new testnet key
   - Secret Key: Your new testnet secret
   - Custom URL: `https://testnet.binance.vision/api/v3`
   - Is Active: ✅

4. **Watch terminal logs:**

**✅ Success (Credentials valid):**
```
🔄 Fetching price from BINANCE
✅ Binance API Response: Price=45231.50, Change=2.34%
```

**❌ Invalid credentials:**
```
❌ Binance API Error (401): Invalid API-key
```

**🚫 Still geo-blocked:**
```
❌ Binance API Error (451): Service unavailable from restricted location
```

---

## Troubleshooting

### "Cannot find module 'pg'"

```bash
npm install pg
```

### "Database connection error"

Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql  # if not running
```

### "Port 5000 already in use"

```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill it (replace PID with actual number)
sudo kill -9 PID
```

### App works but no database data

Run migrations:
```bash
npm run db:push
```

---

## Summary

✅ **No code changes needed** when switching between Replit and Ubuntu  
✅ **Automatic detection** of local vs. cloud environment  
✅ **Zero configuration** - just install `pg` package and run  
✅ **Full functionality** on both platforms  

**Now you can test if Binance API works from India!** 🚀
