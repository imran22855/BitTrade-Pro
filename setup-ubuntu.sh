#!/bin/bash
# BitTrader Pro - Ubuntu Server Setup Script
# This script sets up the complete environment for running the app on Ubuntu

set -e  # Exit on any error

echo "=========================================="
echo "BitTrader Pro - Ubuntu Setup Script"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

echo "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System updated"

echo ""
echo "Step 2: Installing Node.js 20.x..."
# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_status "Node.js installed"
else
    print_status "Node.js already installed ($(node --version))"
fi

echo ""
echo "Step 3: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_status "PostgreSQL installed and started"
else
    print_status "PostgreSQL already installed"
fi

echo ""
echo "Step 4: Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    print_status "Git installed"
else
    print_status "Git already installed"
fi

echo ""
echo "Step 5: Setting up PostgreSQL database..."
# Create database and user
DB_NAME="bittrader_pro"
DB_USER="bittrader_user"
DB_PASSWORD=$(openssl rand -base64 32)  # Generate random password

# Check if database exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    print_warning "Database '$DB_NAME' already exists, skipping creation"
else
    sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
    print_status "Database and user created"
fi

echo ""
echo "Step 6: Creating .env file..."
# Create .env file with database credentials
cat > .env <<EOF
# Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

# Session Secret (generate a strong random secret)
SESSION_SECRET=$(openssl rand -base64 64)

# Node Environment
NODE_ENV=production

# Server Configuration
PORT=5000

# Replit Auth Configuration (if needed)
# REPLIT_DEPLOYMENT=1

# Exchange API Credentials (add your keys here)
# BINANCE_API_KEY=your_binance_api_key
# BINANCE_SECRET_KEY=your_binance_secret_key
EOF

print_status ".env file created"
print_warning "Database password saved in .env file"

echo ""
echo "Step 7: Installing application dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_status "Dependencies installed"
    
    # Install pg driver for local PostgreSQL
    npm install pg
    print_status "PostgreSQL driver (pg) installed"
else
    print_error "package.json not found. Please clone the repository first."
    exit 1
fi

echo ""
echo "Step 8: Running database migrations..."
npm run db:push
print_status "Database schema created"

echo ""
echo "Step 9: Building the application..."
# Create a production build (if needed)
print_status "Application ready"

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Database Details:"
echo "  - Name: $DB_NAME"
echo "  - User: $DB_USER"
echo "  - Password: (saved in .env file)"
echo "  - Connection: postgresql://$DB_USER:***@localhost:5432/$DB_NAME"
echo ""
echo "Next Steps:"
echo "  1. Review and update .env file with your API keys"
echo "  2. Start the application:"
echo "     npm run dev"
echo ""
echo "  3. Access the app at: http://localhost:5000"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "  - Keep your .env file secure and don't commit it to Git"
echo "  - Database password is saved in .env"
echo "  - Add your Binance API credentials to .env if needed"
echo ""
