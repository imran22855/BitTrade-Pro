import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Save } from "lucide-react";
import { useState } from "react";

interface StrategyConfigProps {
  onSave: (config: any) => void;
  onStart: () => void;
}

export function StrategyConfig({ onSave, onStart }: StrategyConfigProps) {
  const [strategy, setStrategy] = useState('ma-crossover');
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [stopLoss, setStopLoss] = useState('2.5');
  const [takeProfit, setTakeProfit] = useState('5.0');
  const [tradeSize, setTradeSize] = useState([25]);

  const handleSave = () => {
    const config = {
      strategy,
      riskTolerance: riskTolerance[0],
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      tradeSize: tradeSize[0]
    };
    console.log('Saving strategy config:', config);
    onSave(config);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Trading Strategy Configuration</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="strategy-select">Trading Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger id="strategy-select" data-testid="select-strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ma-crossover">Moving Average Crossover</SelectItem>
                  <SelectItem value="rsi">RSI Based Trading</SelectItem>
                  <SelectItem value="macd">MACD Strategy</SelectItem>
                  <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Tolerance: {riskTolerance[0]}%</Label>
              <Slider
                value={riskTolerance}
                onValueChange={setRiskTolerance}
                max={100}
                step={1}
                data-testid="slider-risk-tolerance"
              />
              <p className="text-xs text-muted-foreground">
                Lower values = more conservative trading
              </p>
            </div>

            <div className="space-y-2">
              <Label>Trade Size: {tradeSize[0]}%</Label>
              <Slider
                value={tradeSize}
                onValueChange={setTradeSize}
                max={100}
                step={5}
                data-testid="slider-trade-size"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of portfolio per trade
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="stop-loss">Stop Loss (%)</Label>
              <Input
                id="stop-loss"
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="2.5"
                data-testid="input-stop-loss"
              />
              <p className="text-xs text-muted-foreground">
                Automatically sell if price drops by this %
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="take-profit">Take Profit (%)</Label>
              <Input
                id="take-profit"
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="5.0"
                data-testid="input-take-profit"
              />
              <p className="text-xs text-muted-foreground">
                Automatically sell if price rises by this %
              </p>
            </div>

            <Card className="p-4 bg-muted/50">
              <h4 className="text-sm font-semibold mb-2">Configuration Summary</h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Strategy: <span className="text-foreground font-medium">{strategy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></p>
                <p className="text-muted-foreground">Max Risk: <span className="text-foreground font-medium">{riskTolerance[0]}%</span></p>
                <p className="text-muted-foreground">Position Size: <span className="text-foreground font-medium">{tradeSize[0]}%</span></p>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} variant="outline" className="flex-1" data-testid="button-save-config">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
          <Button onClick={onStart} className="flex-1" data-testid="button-start-bot">
            <Play className="h-4 w-4 mr-2" />
            Start Bot
          </Button>
        </div>
      </div>
    </Card>
  );
}
