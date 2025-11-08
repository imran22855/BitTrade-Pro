# Ubuntu Authentication Guide

## Important: Replit Auth Won't Work Outside Replit

**Bad News:** Google/Replit authentication (OIDC) only works on Replit's infrastructure. It won't work on your local Ubuntu machine because:

- ✗ Callback URLs are tied to Replit domains
- ✗ REPL_ID is Replit-specific
- ✗ OIDC issuer requires Replit's servers

**Good News:** You can still test everything (including Binance API) using Mock Auth Mode!

---

## Solution: Use Mock Auth Mode on Ubuntu

This gives you the **exact same app experience**, just with automatic login instead of Google auth.

### Quick Setup on Ubuntu

```bash
cd ~/BitTrade-Pro
git pull origin main

# Install pg driver
npm install pg

# Create/update .env file with mock auth enabled
cat > .env <<'EOF'
# Database
DATABASE_URL=postgresql://bittrader_user:your_password@localhost:5432/bittrader_pro

# Session
SESSION_SECRET=local-dev-secret-change-in-production

# Server
NODE_ENV=development
PORT=5000

# Enable Mock Auth (automatically logs you in)
LOCAL_AUTH_MODE=mock
EOF

# Run the app
npm run dev
```

**Replace `your_password` with your actual PostgreSQL password!**

---

## What You'll See

### Terminal Output:
```
🔧 Using local PostgreSQL driver (pg)
🔧 MOCK AUTH MODE - Using fake user (set LOCAL_AUTH_MODE=mock)
📝 Mock user: dev@localhost.com
✅ Mock user created
Server running on http://0.0.0.0:5000
```

### Browser Experience:
1. Open http://localhost:5000
2. **You're automatically logged in!** (No Google auth needed)
3. All features work exactly the same
4. Your user: dev@localhost.com

---

## Testing Binance API

Now you can test if your Binance credentials work from India:

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Add Binance Credentials

1. Open http://localhost:5000
2. Go to **Settings → Exchange Credentials**
3. Click **Add Credentials**
4. Fill in:
   - Exchange: **Binance**
   - API Key: Your new testnet API key
   - Secret Key: Your new testnet secret key
   - Custom URL: `https://testnet.binance.vision/api/v3`
   - Is Active: ✅ **Enabled**

### Step 3: Watch Terminal Logs

**✅ If credentials work from India:**
```
🔄 Fetching price from BINANCE
📡 Calling Binance API: https://testnet.binance.vision/api/v3/ticker/24hr?symbol=BTCUSDT
✅ Binance API Response: Price=45231.50, Change=2.34%
```

**❌ If credentials are invalid:**
```
❌ Binance API Error (401): {"code":-2015,"msg":"Invalid API-key"}
```

**🚫 If still geo-blocked:**
```
❌ Binance API Error (451): Service unavailable from restricted location
```

---

## Comparison: Replit vs Ubuntu

| Feature | Replit | Ubuntu (Mock Mode) |
|---------|--------|-------------------|
| Database | Neon PostgreSQL | Local PostgreSQL |
| Authentication | Google/Replit Auth | Mock (auto-login) |
| User Experience | Real login flow | Automatic login |
| All Features | ✅ Working | ✅ Working |
| Binance API | ❌ Geo-blocked | ✅ Should work |
| Price Data | CoinGecko fallback | Binance (hopefully!) |

---

## Why This Approach Works

### What Changes:
- ❌ No Google authentication
- ✅ Automatic mock login

### What Stays the Same:
- ✅ **All app features** (strategies, trading, portfolio)
- ✅ **Same UI/UX**
- ✅ **Real database** (your local PostgreSQL)
- ✅ **API testing** (Binance credentials work the same way)
- ✅ **Price charts, transactions, everything!**

---

## Switching Modes

### Mock Mode (Ubuntu testing):
```bash
# In .env file
LOCAL_AUTH_MODE=mock
```

### Normal Mode (Replit only):
```bash
# In .env file - remove or comment out
# LOCAL_AUTH_MODE=mock
```

Or just don't include `LOCAL_AUTH_MODE` at all - it defaults to normal Replit Auth.

---

## Troubleshooting

### "Failed to deserialize user out of session"

This happens when you have old sessions from before switching to mock mode.

**Solution:**
```bash
# Clear the sessions table
psql -U bittrader_user -d bittrader_pro
DELETE FROM sessions;
\q

# Or restart with fresh database
npm run db:push --force
```

### App crashes on startup

Make sure you have:
1. ✅ PostgreSQL running: `sudo systemctl status postgresql`
2. ✅ `.env` file with correct database password
3. ✅ `pg` package installed: `npm install pg`
4. ✅ `LOCAL_AUTH_MODE=mock` in `.env`

---

## Summary

✅ **Mock auth = Automatic login** (no Google needed)  
✅ **All features work the same**  
✅ **Perfect for testing Binance API from India**  
✅ **Same database, same UI, same experience**

**The only difference:** You're automatically logged in as dev@localhost.com instead of using Google.

---

**Now test your Binance credentials and see if they work from India!** 🚀
