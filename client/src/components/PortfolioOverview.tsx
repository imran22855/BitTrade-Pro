import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, Bitcoin } from "lucide-react";

interface PortfolioStats {
  totalValue: number;
  todayPL: number;
  totalPL: number;
  btcBalance: number;
}

export function PortfolioOverview({ totalValue, todayPL, totalPL, btcBalance }: PortfolioStats) {
  const todayIsPositive = todayPL >= 0;
  const totalIsPositive = totalPL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Portfolio Value</p>
            <h3 className="text-3xl font-bold font-mono" data-testid="text-portfolio-value">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Today's P/L</p>
            <h3 className={`text-3xl font-bold font-mono ${todayIsPositive ? 'text-chart-3' : 'text-destructive'}`} data-testid="text-today-pl">
              {todayIsPositive ? '+' : ''}${Math.abs(todayPL).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${todayIsPositive ? 'bg-chart-3/10' : 'bg-destructive/10'}`}>
            <TrendingUp className={`h-6 w-6 ${todayIsPositive ? 'text-chart-3' : 'text-destructive'}`} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total P/L</p>
            <h3 className={`text-3xl font-bold font-mono ${totalIsPositive ? 'text-chart-3' : 'text-destructive'}`} data-testid="text-total-pl">
              {totalIsPositive ? '+' : ''}${Math.abs(totalPL).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${totalIsPositive ? 'bg-chart-3/10' : 'bg-destructive/10'}`}>
            <DollarSign className={`h-6 w-6 ${totalIsPositive ? 'text-chart-3' : 'text-destructive'}`} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">BTC Balance</p>
            <h3 className="text-3xl font-bold font-mono" data-testid="text-btc-balance">
              {btcBalance.toFixed(6)}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bitcoin className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
}
