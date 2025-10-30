import { TradingBotPanel } from '../TradingBotPanel';

export default function TradingBotPanelExample() {
  return (
    <TradingBotPanel 
      stats={{
        isActive: true,
        strategyName: "Moving Average Crossover",
        tradesToday: 12,
        successRate: 68,
        activePositions: 3
      }}
      onToggle={(active) => console.log('Bot toggled:', active)}
      onConfigure={() => console.log('Configure clicked')}
    />
  );
}
