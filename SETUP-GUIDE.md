# BitTrader Pro - Local Ubuntu Setup Guide

This guide will help you set up and run BitTrader Pro on your local Ubuntu VM.

## Prerequisites

- Ubuntu 20.04 or later (or Ubuntu-based distribution)
- User account with sudo privileges
- At least 2GB RAM
- 10GB free disk space
- Internet connection

## Quick Setup (Automated)

### 1. Clone the Repository

First, push your code to GitHub (if you haven't already), then clone it on your Ubuntu VM:

```bash
# Clone from your GitHub repository
git clone https://github.com/imran22855/BitTrade-Pro.git
cd BitTrade-Pro
```

### 2. Run the Setup Script

```bash
# Make the script executable
chmod +x setup-ubuntu.sh

# Run the setup script
./setup-ubuntu.sh
```

The script will:
- ✅ Install Node.js 20.x
- ✅ Install PostgreSQL
- ✅ Create database and user
- ✅ Generate secure passwords
- ✅ Create `.env` file
- ✅ Install npm dependencies
- ✅ Run database migrations

### 3. Configure Your API Keys

Edit the `.env` file and add your Binance credentials:

```bash
nano .env
```

Add your keys:
```env
# Exchange API Credentials
BINANCE_API_KEY=your_testnet_api_key_here
BINANCE_SECRET_KEY=your_testnet_secret_key_here
```

Save and exit (Ctrl+X, then Y, then Enter)

### 4. Start the Application

```bash
# Development mode
npm run dev
```

The app will be available at: **http://localhost:5000**

---

## Manual Setup (Step-by-Step)

If you prefer to set up manually:

### Step 1: Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 2: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify it's running
sudo systemctl status postgresql
```

### Step 3: Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (in PostgreSQL prompt)
CREATE DATABASE bittrader_pro;
CREATE USER bittrader_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bittrader_pro TO bittrader_user;
\c bittrader_pro
GRANT ALL ON SCHEMA public TO bittrader_user;
\q
```

### Step 4: Clone and Setup Application

```bash
# Clone repository
git clone https://github.com/imran22855/BitTrade-Pro.git
cd BitTrade-Pro

# Create .env file
cat > .env <<EOF
DATABASE_URL=postgresql://bittrader_user:your_secure_password@localhost:5432/bittrader_pro
SESSION_SECRET=$(openssl rand -base64 64)
NODE_ENV=production
PORT=5000
EOF

# Install dependencies
npm install

# Run migrations
npm run db:push
```

### Step 5: Start Application

```bash
npm run dev
```

---

## Configuration

### Environment Variables

All configuration is done via the `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Session
SESSION_SECRET=your_random_secret_here

# Server
NODE_ENV=production
PORT=5000

# Exchange APIs (optional)
BINANCE_API_KEY=your_api_key
BINANCE_SECRET_KEY=your_secret_key
```

### Adding Binance Credentials

After starting the app:

1. Open http://localhost:5000
2. Log in with Replit Auth
3. Go to Settings → Exchange Credentials
4. Add your Binance testnet credentials:
   - Exchange: Binance
   - API Key: Your testnet API key
   - Secret Key: Your testnet secret key
   - Custom URL: `https://testnet.binance.vision/api/v3`
   - Enable "Is Active"

---

## Running in Production

### Using PM2 (Recommended)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start npm --name "bittrader-pro" -- run dev

# Enable startup on boot
pm2 startup
pm2 save

# Monitor logs
pm2 logs bittrader-pro

# Restart app
pm2 restart bittrader-pro

# Stop app
pm2 stop bittrader-pro
```

### Using systemd

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/bittrader-pro.service
```

Add this content:

```ini
[Unit]
Description=BitTrader Pro Trading Application
After=network.target postgresql.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/BitTrade-Pro
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable bittrader-pro
sudo systemctl start bittrader-pro
sudo systemctl status bittrader-pro
```

---

## Troubleshooting

### Port 5000 Already in Use

```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process (replace PID)
sudo kill -9 PID

# Or change port in .env
PORT=3000
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U bittrader_user -d bittrader_pro -h localhost

# Check DATABASE_URL in .env is correct
```

### Permission Errors

```bash
# Fix database permissions
sudo -u postgres psql
\c bittrader_pro
GRANT ALL ON SCHEMA public TO bittrader_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO bittrader_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO bittrader_user;
\q
```

### NPM Install Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Security Checklist

- [ ] Use strong database password
- [ ] Keep `.env` file secure (add to .gitignore)
- [ ] Use firewall (ufw) to restrict access
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Use HTTPS in production (nginx + Let's Encrypt)
- [ ] Regularly backup database
- [ ] Monitor logs for suspicious activity

---

## Accessing from Other Devices

If you want to access the app from other devices on your network:

```bash
# Find your VM's IP address
ip addr show

# Allow port 5000 through firewall
sudo ufw allow 5000/tcp

# Access from other devices
http://YOUR_VM_IP:5000
```

---

## Backup and Restore

### Backup Database

```bash
pg_dump -U bittrader_user -d bittrader_pro > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U bittrader_user -d bittrader_pro < backup_20250131.sql
```

---

## Need Help?

If you encounter issues:

1. Check logs: `pm2 logs bittrader-pro` or `sudo journalctl -u bittrader-pro -f`
2. Verify environment variables in `.env`
3. Check PostgreSQL is running: `sudo systemctl status postgresql`
4. Test Binance API directly: `curl https://testnet.binance.vision/api/v3/ticker/24hr?symbol=BTCUSDT`

---

**Enjoy trading with BitTrader Pro!** 🚀
