import { PortfolioOverview } from '../PortfolioOverview';

export default function PortfolioOverviewExample() {
  return (
    <PortfolioOverview 
      totalValue={105842.50}
      todayPL={2847.32}
      totalPL={5842.50}
      btcBalance={1.5642}
    />
  );
}
