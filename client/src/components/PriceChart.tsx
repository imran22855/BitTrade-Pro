import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState } from "react";

const timeframes = ['1H', '4H', '1D', '1W', '1M', '1Y'];

// Mock data for demonstration
const generateMockData = (points: number) => {
  const data = [];
  let basePrice = 67000;
  const now = Date.now();
  
  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * 3600000);
    basePrice = basePrice + (Math.random() - 0.5) * 800;
    data.push({
      time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(basePrice * 100) / 100,
      volume: Math.random() * 1000000
    });
  }
  return data;
};

export function PriceChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [chartData] = useState(generateMockData(24)); // todo: remove mock functionality

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Price Chart</h3>
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={selectedTimeframe === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSelectedTimeframe(tf);
                  console.log('Timeframe selected:', tf);
                }}
                data-testid={`button-timeframe-${tf.toLowerCase()}`}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
