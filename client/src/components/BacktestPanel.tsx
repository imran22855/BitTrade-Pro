import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Play, Download, CalendarIcon, TrendingUp, DollarSign, Activity } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Mock backtest data - todo: remove mock functionality
const generateBacktestResults = () => {
  const data = [];
  let balance = 100000;
  const now = Date.now();
  
  for (let i = 0; i <= 30; i++) {
    const timestamp = now - ((30 - i) * 86400000);
    balance = balance + (Math.random() - 0.45) * 3000;
    data.push({
      date: format(new Date(timestamp), 'MM/dd'),
      balance: Math.round(balance),
      benchmark: 100000 + (i * 500)
    });
  }
  return data;
};

export function BacktestPanel() {
  const [strategy, setStrategy] = useState('ma-crossover');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [initialCapital, setInitialCapital] = useState('100000');
  const [isRunning, setIsRunning] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState(generateBacktestResults());

  const strategies = [
    { value: 'ma-crossover', label: 'Moving Average Crossover' },
    { value: 'rsi', label: 'RSI Based Trading' },
    { value: 'macd', label: 'MACD Strategy' },
    { value: 'bollinger', label: 'Bollinger Bands' },
  ];

  const runBacktest = () => {
    setIsRunning(true);
    console.log('Running backtest:', { strategy, startDate, endDate, initialCapital });
    
    // Simulate backtest running
    setTimeout(() => {
      setResults(generateBacktestResults());
      setHasResults(true);
      setIsRunning(false);
    }, 2000);
  };

  const exportResults = () => {
    console.log('Exporting backtest results');
  };

  const backtestStats = {
    finalBalance: results[results.length - 1].balance,
    totalReturn: ((results[results.length - 1].balance - parseFloat(initialCapital)) / parseFloat(initialCapital) * 100).toFixed(2),
    winRate: 64.5,
    totalTrades: 127,
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Backtest Configuration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Test your trading strategy against historical data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="backtest-strategy">Trading Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger id="backtest-strategy" data-testid="select-backtest-strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-capital">Initial Capital ($)</Label>
              <Input
                id="initial-capital"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                placeholder="100000"
                data-testid="input-initial-capital"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={runBacktest}
              disabled={isRunning || !startDate || !endDate}
              className="flex-1"
              data-testid="button-run-backtest"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? 'Running Backtest...' : 'Run Backtest'}
            </Button>
            {hasResults && (
              <Button 
                onClick={exportResults}
                variant="outline"
                data-testid="button-export-results"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </Card>

      {hasResults && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Final Balance</p>
                  <h3 className="text-2xl font-bold font-mono" data-testid="text-final-balance">
                    ${backtestStats.finalBalance.toLocaleString()}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Return</p>
                  <h3 className={`text-2xl font-bold font-mono ${parseFloat(backtestStats.totalReturn) >= 0 ? 'text-chart-3' : 'text-destructive'}`} data-testid="text-total-return">
                    {parseFloat(backtestStats.totalReturn) >= 0 ? '+' : ''}{backtestStats.totalReturn}%
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
                  <h3 className="text-2xl font-bold font-mono" data-testid="text-win-rate">
                    {backtestStats.winRate}%
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Trades</p>
                  <h3 className="text-2xl font-bold font-mono" data-testid="text-total-trades">
                    {backtestStats.totalTrades}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Strategy Balance"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Buy & Hold"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
