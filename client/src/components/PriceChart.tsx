import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const timeframes = [
  { label: '1H', hours: 1 },
  { label: '4H', hours: 4 },
  { label: '1D', hours: 24 },
  { label: '1W', hours: 168 },
  { label: '1M', hours: 720 },
  { label: '1Y', hours: 8760 },
];

export function PriceChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  // Get hours for the selected timeframe
  const hours = timeframes.find(tf => tf.label === selectedTimeframe)?.hours || 24;
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: [`/api/price/chart?hours=${hours}`],
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Price Chart</h3>
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf.label}
                variant={selectedTimeframe === tf.label ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSelectedTimeframe(tf.label);
                }}
                data-testid={`button-timeframe-${tf.label.toLowerCase()}`}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-[32rem]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData || []}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
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
                  domain={[(dataMin: number) => dataMin - 500, (dataMax: number) => dataMax + 500]}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  width={80}
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
          )}
        </div>
      </div>
    </Card>
  );
}
