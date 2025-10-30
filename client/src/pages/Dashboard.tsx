import { PriceDisplay } from "@/components/PriceDisplay";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TradingBotPanel } from "@/components/TradingBotPanel";
import { PriceChart } from "@/components/PriceChart";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useState } from "react";

// todo: remove mock functionality
const mockTransactions = [
  {
    id: '1',
    time: '14:32:10',
    type: 'buy' as const,
    amount: 0.052,
    price: 67842.50,
    total: 3527.81,
    status: 'completed' as const
  },
  {
    id: '2',
    time: '13:15:42',
    type: 'sell' as const,
    amount: 0.038,
    price: 67520.00,
    total: 2565.76,
    status: 'completed' as const
  },
  {
    id: '3',
    time: '12:08:33',
    type: 'buy' as const,
    amount: 0.075,
    price: 67100.00,
    total: 5032.50,
    status: 'pending' as const
  },
  {
    id: '4',
    time: '11:42:18',
    type: 'buy' as const,
    amount: 0.120,
    price: 66950.00,
    total: 8034.00,
    status: 'completed' as const
  },
  {
    id: '5',
    time: '10:25:55',
    type: 'sell' as const,
    amount: 0.095,
    price: 67200.00,
    total: 6384.00,
    status: 'completed' as const
  },
];

export default function Dashboard() {
  const [botActive, setBotActive] = useState(true);

  return (
    <div className="space-y-6">
      <PriceDisplay 
        price={67842.50}
        change24h={3.25}
        high24h={68420.00}
        low24h={66100.00}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart />
        </div>
        <div>
          <TradingBotPanel 
            stats={{
              isActive: botActive,
              strategyName: "Moving Average Crossover",
              tradesToday: 12,
              successRate: 68,
              activePositions: 3
            }}
            onToggle={setBotActive}
            onConfigure={() => console.log('Configure strategy')}
          />
        </div>
      </div>

      <PortfolioOverview 
        totalValue={105842.50}
        todayPL={2847.32}
        totalPL={5842.50}
        btcBalance={1.5642}
      />

      <TransactionsTable transactions={mockTransactions} />
    </div>
  );
}
