import { PriceDisplay } from "@/components/PriceDisplay";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TradingBotPanel } from "@/components/TradingBotPanel";
import { PriceChart } from "@/components/PriceChart";
import { TransactionsTable } from "@/components/TransactionsTable";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { data: priceData, isLoading: priceLoading } = useQuery({
    queryKey: ['/api/price/current'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    refetchInterval: 15000,
  });

  if (priceLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PriceDisplay 
        price={priceData?.price || 0}
        change24h={priceData?.change24h || 0}
        high24h={priceData?.high24h || 0}
        low24h={priceData?.low24h || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart />
        </div>
        <div>
          <TradingBotPanel 
            stats={statsData?.bot || {
              isActive: false,
              strategyName: "No active strategy",
              tradesToday: 0,
              successRate: 0,
              activePositions: 0
            }}
            onToggle={() => {}}
            onConfigure={() => window.location.href = '/bot'}
          />
        </div>
      </div>

      <PortfolioOverview 
        totalValue={statsData?.portfolio?.totalValue || 100000}
        todayPL={statsData?.portfolio?.todayPL || 0}
        totalPL={statsData?.portfolio?.totalPL || 0}
        btcBalance={parseFloat(statsData?.portfolio?.btcBalance || "0")}
      />

      {transactionsLoading ? (
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      ) : (
        <TransactionsTable transactions={transactions || []} />
      )}
    </div>
  );
}
