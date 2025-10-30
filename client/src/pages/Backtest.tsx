import { BacktestPanel } from "@/components/BacktestPanel";

export default function Backtest() {
  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Strategy Backtesting</h1>
        <p className="text-muted-foreground mt-2">
          Test your trading strategies against historical market data to evaluate performance
        </p>
      </div>

      <BacktestPanel />
    </div>
  );
}
