import { PriceDisplay } from '../PriceDisplay';

export default function PriceDisplayExample() {
  return (
    <PriceDisplay 
      price={67842.50}
      change24h={3.25}
      high24h={68420.00}
      low24h={66100.00}
    />
  );
}
