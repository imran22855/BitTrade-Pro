# BitTrader Pro - Automated Bitcoin Trading Platform

## Overview

BitTrader Pro is an automated Bitcoin trading application that provides real-time market data, algorithmic trading strategies, and portfolio management. The platform allows users to configure trading bots with various strategies (including Grid Trading, Traditional Grid Trading, Moving Average Crossover, RSI, MACD, and Bollinger Bands), backtest them against historical data, and execute paper trading with a simulated $100,000 starting balance. The application features real-time Bitcoin price charts on the Dashboard and supports multiple exchange integrations (Binance, Bitget, Coinbase, Kraken, Bybit) for fetching live price data. The system automatically uses exchange APIs when credentials are configured, falling back to CoinGecko when no exchange is active.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and API data fetching

**UI Component System**
- shadcn/ui component library with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for styling with custom design tokens
- Dark/light theme support with ThemeProvider context
- Custom design system following financial application patterns (defined in design_guidelines.md)

**Typography & Fonts**
- Inter/Manrope for primary text
- JetBrains Mono for numerical data, prices, and timestamps
- Design emphasizes high-density data display without visual clutter

**Component Structure**
- Feature-based components: PriceDisplay, PortfolioOverview, TradingBotPanel, PriceChart, TransactionsTable, StrategyEvents
- Configuration components: StrategyConfig, BacktestPanel, ExchangeCredentials, NotificationConfig
- Reusable UI primitives from shadcn/ui in components/ui/
- Layout components: AppSidebar for navigation, ThemeProvider for theme management

**State Management Strategy**
- React Query for server state with aggressive caching (staleTime: Infinity)
- Local component state with React hooks for UI state
- Context API for theme and user preferences
- Optimistic updates via React Query mutations

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js for REST API endpoints
- TypeScript for type safety across the stack
- ESM modules (type: "module" in package.json)

**API Structure**
The backend exposes RESTful endpoints organized by feature:
- `/api/price/current` - Real-time Bitcoin price data
- `/api/price/chart` - Real-time chart data with configurable timeframes
- `/api/portfolio` - User portfolio management
- `/api/strategies` - CRUD operations for trading strategies
- `/api/strategies/:id/events` - Strategy event log (start/stop events with timestamps and configuration details)
- `/api/transactions` - Transaction history
- `/api/alerts` - Price alert management
- `/api/exchange-credentials` - Exchange API credential storage
- `/api/stats` - Aggregated trading statistics

**Services Layer**
- **PriceService**: Fetches Bitcoin price data from CoinGecko API with fallback to mock data, updates every 60 seconds
- **TradingBot**: Executes trading strategies on 30-second intervals, performs paper trading simulations
- **Storage**: Abstraction layer for data persistence with in-memory implementation

**Trading Bot Logic**
- Supports multiple strategy types: Grid Trading, Traditional Grid Trading, Moving Average Crossover, RSI, MACD, Bollinger Bands
- **Grid Trading Strategy (Dip-Buying)**: Automatically buys Bitcoin at every $X price dip from initial price and sells at Y% profit
  - Configurable grid interval (default: $2000)
  - Configurable profit target (default: 5%)
  - Tracks initial price and maintains open grid orders in strategyState
  - Each buy creates a paired sell order for automated profit-taking
  - Unidirectional strategy (only buys on dips, never sells below initial price)
- **Traditional Grid Trading Strategy**: Bidirectional grid trading that profits from price oscillations
  - Configurable price range (gridLowerBound, gridUpperBound)
  - Configurable grid interval for spacing between levels
  - Places buy orders at all levels BELOW current price
  - Places sell orders at all levels ABOVE current price
  - Executes orders automatically when price crosses grid levels
  - Profits from volatility in ranging markets
  - Best suited for sideways price movements within the defined range
  - Validation enforced: grid interval must be positive, bounds must be valid
- Configurable risk parameters: stop loss, take profit, trade size percentage
- Paper trading simulation with USD/BTC balance tracking
- Strategy execution runs on 30-second intervals when activated
- Re-fetches strategy state on each interval to ensure fresh data
- Backend validation prevents infinite loops from invalid grid intervals

### Data Storage Solutions

**Database Technology**
- PostgreSQL via Neon serverless database
- Drizzle ORM for type-safe database queries and schema management
- WebSocket connection pooling for serverless environment

**Schema Design**
The application defines the following core tables:
- `users`: User authentication and profiles
- `portfolio`: User balances (BTC and USD)
- `trading_strategies`: Strategy configurations with parameters
- `strategy_events`: Strategy start/stop event log with timestamps, initial/final prices, and configuration details (grid interval, profit %, trade size)
- `transactions`: Buy/sell transaction history
- `price_alerts`: User-defined price notifications
- `exchange_credentials`: Encrypted API keys for exchange integrations
- `notification_settings`: User notification preferences

**Data Access Pattern**
- Repository pattern via storage interface (IStorage)
- Type-safe schema validation using Drizzle Zod
- User-scoped data access using authenticated user ID from OIDC claims

### Authentication and Authorization

**Current Implementation**
- **Replit Auth (OIDC)**: Secure authentication via OAuth with support for Google, GitHub, Apple, X, and email/password login
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple for persistent user sessions
- **User Management**: Automatic user creation/update on login with profile data (email, firstName, lastName, profileImageUrl)
- **Protected Routes**: All API endpoints (except `/api/price/*` and auth routes) require authentication via `isAuthenticated` middleware
- **Frontend Auth**: `useAuth()` hook provides authentication state, user data, and loading status
- **Login Flow**: Landing page for logged-out users → Replit Auth login → Redirect to Dashboard
- **User Experience**: Optimized single auth query at layout level prevents duplicate requests, loading spinner during auth check

**Security Features**
- Session-based authentication with secure cookies
- User ID from OIDC claims (`req.user.claims.sub`) used for all database operations
- Protected API routes reject unauthenticated requests with 401 status
- Automatic session persistence across browser refreshes
- Secure logout clears session and redirects to landing page

**User Interface**
- Landing page displays for unauthenticated users with "Get Started" login button
- Dashboard with sidebar displays for authenticated users
- User profile information shown in sidebar footer (avatar, name, email)
- Logout button in sidebar footer for easy session termination

## External Dependencies

### Third-Party APIs

**Price Data APIs**
- **Exchange APIs** (Primary when credentials configured):
  - Binance: `https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT`
  - Bitget: `https://api.bitget.com/api/v2/spot/market/tickers?symbol=BTCUSDT`
  - Coinbase: `https://api.exchange.coinbase.com/products/BTC-USD/stats`
  - Kraken: `https://api.kraken.com/0/public/Ticker?pair=XBTUSD`
  - Bybit: `https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCUSDT`
- **CoinGecko API** (Fallback):
  - Purpose: Real-time Bitcoin price data, 24-hour statistics
  - Endpoint: `https://api.coingecko.com/api/v3/simple/price`
  - Data retrieved: Current price, 24h change, 24h high/low
  - Fallback: Mock data generation if API fails
  - Rate limiting: Managed via 60-second refresh intervals

**Price Service Behavior**
- On startup and every 60 seconds, checks for active exchange credentials
- If credentials exist and are active, fetches from the configured exchange API
- If no active credentials, falls back to CoinGecko API
- All exchange responses are normalized to common BitcoinPrice interface
- Supports custom API URLs for each exchange

### Database & Infrastructure

**Neon Serverless PostgreSQL**
- Cloud-hosted PostgreSQL database
- WebSocket-based connections for serverless compatibility
- Connection pooling via @neondatabase/serverless package
- Environment variable: `DATABASE_URL` (required)

### UI Libraries & Components

**Radix UI Primitives** (Comprehensive set)
- Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu
- Form controls, Popovers, Tooltips, Tabs, Navigation Menu
- Provides accessible, unstyled components as foundation

**Recharts**
- Chart visualization library for price charts and backtest results
- Line charts, area charts for trading data visualization

**React Icons**
- Social platform icons (Telegram, WhatsApp for notifications)
- Lucide React for general UI icons

**Additional Libraries**
- date-fns: Date formatting and manipulation
- cmdk: Command palette component
- class-variance-authority: Type-safe variant styling
- react-hook-form with Zod resolvers: Form validation

### Development Tools

**Replit-Specific Plugins**
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Code mapping
- @replit/vite-plugin-dev-banner: Development environment indicator

### Planned Integrations

**Exchange APIs** (Configured but not actively used)
- Binance, Coinbase Pro, Kraken
- Stored credentials schema exists for future live trading

**Notification Services** (UI prepared, not implemented)
- Telegram Bot API
- WhatsApp integration
- Twilio SMS
- Configuration UI exists in Settings page