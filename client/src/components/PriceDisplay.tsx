import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface PriceDisplayProps {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

export function PriceDisplay({ price, change24h, high24h, low24h }: PriceDisplayProps) {
  const [animatedPrice, setAnimatedPrice] = useState(price);
  const isPositive = change24h >= 0;

  useEffect(() => {
    setAnimatedPrice(price);
  }, [price]);

  return (
    <Card className="p-8">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Bitcoin Price</p>
            <div className="flex items-baseline gap-4">
              <h2 className="text-5xl font-bold font-mono" data-testid="text-btc-price">
                ${animatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className={`flex items-center gap-1 text-lg font-semibold ${isPositive ? 'text-chart-3' : 'text-destructive'}`}>
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <span data-testid="text-price-change">
                  {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-8 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">24h High</p>
            <p className="text-lg font-mono font-semibold" data-testid="text-24h-high">
              ${high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">24h Low</p>
            <p className="text-lg font-mono font-semibold" data-testid="text-24h-low">
              ${low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-sm font-medium">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
