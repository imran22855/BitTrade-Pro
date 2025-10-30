import { StrategyConfig } from '../StrategyConfig';

export default function StrategyConfigExample() {
  return (
    <StrategyConfig 
      onSave={(config) => console.log('Config saved:', config)}
      onStart={() => console.log('Bot started')}
    />
  );
}
