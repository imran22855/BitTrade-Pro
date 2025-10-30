import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Bot, BarChart3, Shield, Zap, LineChart } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                BitTrader Pro
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Automated Bitcoin trading with advanced algorithmic strategies, real-time market data, and paper trading simulation
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                className="text-lg px-8"
                data-testid="button-login"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Automated Trading Bots</h3>
                <p className="text-sm text-muted-foreground">
                  Configure and deploy trading strategies including Grid Trading, RSI, MACD, Moving Average, and Bollinger Bands
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                <LineChart className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Real-Time Market Data</h3>
                <p className="text-sm text-muted-foreground">
                  Live Bitcoin price charts with multiple exchange integrations including Binance, Coinbase, Kraken, and more
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Strategy Backtesting</h3>
                <p className="text-sm text-muted-foreground">
                  Test your trading strategies against historical data to evaluate performance before going live
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Paper Trading</h3>
                <p className="text-sm text-muted-foreground">
                  Start with $100,000 virtual USD to practice trading strategies without any financial risk
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground">
                  Encrypted API credentials, session-based authentication, and enterprise-grade security
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Portfolio Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track your BTC and USD balances, view transaction history, and monitor trading performance
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-background">
          <h2 className="text-3xl font-bold mb-4">
            Start Trading Smarter Today
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join BitTrader Pro and experience the power of automated Bitcoin trading with advanced strategies and real-time insights
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="text-lg px-8"
            data-testid="button-login-cta"
          >
            Log In to Get Started
          </Button>
        </Card>
      </div>
    </div>
  );
}
