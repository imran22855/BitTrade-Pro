#!/bin/bash
# Quick fix for Ubuntu - Run this script to fix the session error

echo "🔧 Fixing Ubuntu environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env <<'EOF'
# Database Connection (IMPORTANT: Update with your actual password!)
DATABASE_URL=postgresql://bittrader_user:YOUR_PASSWORD_HERE@localhost:5432/bittrader_pro

# Session Secret
SESSION_SECRET=local-dev-secret-change-in-production

# Server Configuration
NODE_ENV=development
PORT=5000
EOF
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and replace YOUR_PASSWORD_HERE with your actual PostgreSQL password!"
    echo "   Run: nano .env"
    echo ""
else
    echo "✅ .env file already exists"
    
    # Check if SESSION_SECRET exists
    if ! grep -q "SESSION_SECRET" .env; then
        echo "📝 Adding SESSION_SECRET to .env..."
        echo "SESSION_SECRET=local-dev-secret-change-in-production" >> .env
        echo "✅ SESSION_SECRET added!"
    else
        echo "✅ SESSION_SECRET already set"
    fi
fi

# Install pg if not installed
if ! npm list pg > /dev/null 2>&1; then
    echo "📦 Installing PostgreSQL driver (pg)..."
    npm install pg
    echo "✅ pg installed!"
else
    echo "✅ pg already installed"
fi

echo ""
echo "🎉 Setup complete! Now run:"
echo "   npm run dev"
echo ""
