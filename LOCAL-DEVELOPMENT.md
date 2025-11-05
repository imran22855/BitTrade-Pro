# Running BitTrader Pro Locally on Ubuntu

## Quick Start

Your app is now configured to run in **local development mode** when running outside of Replit.

### What Changes in Local Mode:

✅ **Authentication is automatically disabled**  
✅ **Mock user session is created** (dev@localhost.com)  
✅ **All API endpoints work** without login  
✅ **Database uses local PostgreSQL**  
✅ **Full functionality** for testing  

---

## Running the App

### 1. Start the Application

```bash
npm run dev
```

You should see:
```
🔧 Running in LOCAL DEVELOPMENT mode - Auth disabled
📝 Using mock user session for testing
✅ Mock user created: dev@localhost.com
Server running on http://0.0.0.0:5000
```

### 2. Access the App

Open your browser and go to:
```
http://localhost:5000
```

The app will automatically log you in as the mock user!

---

## Mock User Details

When running locally, you're automatically logged in as:

- **User ID:** `local-dev-user`
- **Email:** `dev@localhost.com`
- **Name:** Local Developer
- **Session:** Auto-renewed (24 hours)

This user is stored in your local PostgreSQL database and persists across restarts.

---

## Testing Binance API

Now you can test your Binance credentials without geographic restrictions!

### Step 1: Start the App

```bash
npm run dev
```

### Step 2: Add Binance Credentials

1. Open http://localhost:5000
2. Go to **Settings** → **Exchange Credentials**
3. Click **Add Credentials**
4. Fill in:
   - **Exchange:** Binance
   - **API Key:** Your testnet API key
   - **Secret Key:** Your testnet secret key
   - **Custom URL:** `https://testnet.binance.vision/api/v3`
   - **Is Active:** ✅ Enabled

### Step 3: Watch the Logs

In your terminal, you should see:

**If credentials are VALID:**
```
🔄 Fetching price from BINANCE (Custom URL: https://testnet.binance.vision/api/v3)
📡 Calling Binance API: https://testnet.binance.vision/api/v3/ticker/24hr?symbol=BTCUSDT
✅ Binance API Response: Price=45231.50, Change=2.34%
```

**If credentials are INVALID:**
```
🔄 Fetching price from BINANCE
📡 Calling Binance API: https://testnet.binance.vision/api/v3/ticker/24hr?symbol=BTCUSDT
❌ Binance API Error (401): {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
⚠️  binance failed, falling back to CoinGecko
```

**If geographic block persists:**
```
❌ Binance API Error (451): Service unavailable from a restricted location
```

---

## Features Available in Local Mode

All features work exactly the same as on Replit:

✅ **Real-time Bitcoin prices** (CoinGecko or Binance)  
✅ **Trading strategies** (Grid Trading, MA, RSI, etc.)  
✅ **Paper trading** with $100K starting balance  
✅ **Portfolio tracking**  
✅ **Transaction history**  
✅ **Price alerts**  
✅ **Exchange integration**  
✅ **Strategy event logging**  

---

## Environment Variables

Your `.env` file should contain:

```env
# Database
DATABASE_URL=postgresql://bittrader_user:your_password@localhost:5432/bittrader_pro

# Session (auto-generated)
SESSION_SECRET=your_random_secret_here

# Server
NODE_ENV=development
PORT=5000

# DO NOT set these for local development:
# REPL_ID=
# REPLIT_DEPLOYMENT=
```

**Important:** The app automatically detects local mode when `REPL_ID` is missing.

---

## Differences from Replit

| Feature | Replit | Local Ubuntu |
|---------|--------|--------------|
| Authentication | Replit Auth (OIDC) | Mock user (auto-login) |
| User Management | Real users | Single mock user |
| Database | Neon PostgreSQL | Local PostgreSQL |
| Binance API | ❌ Geographic block | ✅ Should work from India |
| Session Storage | PostgreSQL | PostgreSQL |
| Port | Auto-assigned | 5000 (configurable) |

---

## Troubleshooting

### "Cannot connect to database"

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql

# Test connection
psql -U bittrader_user -d bittrader_pro -h localhost
```

### "Port 5000 already in use"

```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process (replace PID)
sudo kill -9 PID

# Or change port in .env
PORT=3000
```

### "Session secret warning"

This is just a deprecation warning and can be ignored. The app works fine.

### Binance API still blocked

If you still get error 451 from your Ubuntu VM:
- Your ISP might be blocking Binance
- Try using a VPN
- Or stick with CoinGecko (works great!)

---

## Switching Back to Replit

When you deploy to Replit, the app automatically detects the Replit environment and:

✅ Enables Replit Auth (OIDC)  
✅ Requires real user login  
✅ Uses real user sessions  
✅ Connects to Neon database  

No code changes needed - it's automatic!

---

## Accessing from Other Devices

To access from your phone/tablet on the same network:

```bash
# 1. Find your Ubuntu VM's IP address
ip addr show

# 2. Allow port 5000 through firewall
sudo ufw allow 5000/tcp

# 3. Access from other devices
http://YOUR_VM_IP:5000
```

---

## Next Steps

1. ✅ Start the app: `npm run dev`
2. ✅ Open http://localhost:5000
3. ✅ Add Binance credentials in Settings
4. ✅ Check terminal logs for API response
5. ✅ Start a trading strategy and test!

---

**Happy testing! 🚀**

If Binance works from India, you'll see real testnet API responses in your logs!
