import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Activity, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface BotStats {
  isActive: boolean;
  strategyName: string;
  tradesToday: number;
  successRate: number;
  activePositions: number;
}

interface TradingBotPanelProps {
  stats: BotStats;
  onToggle: (active: boolean) => void;
  onConfigure: () => void;
}

export function TradingBotPanel({ stats, onToggle, onConfigure }: TradingBotPanelProps) {
  const [isActive, setIsActive] = useState(stats.isActive);

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
    onToggle(checked);
    console.log('Bot toggled:', checked);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isActive ? 'bg-chart-3/10' : 'bg-muted'}`}>
              <Activity className={`h-6 w-6 ${isActive ? 'text-chart-3' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Trading Bot</h3>
              <Badge variant={isActive ? "default" : "secondary"} className="mt-1" data-testid="badge-bot-status">
                {isActive ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                )}
              </Badge>
            </div>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            data-testid="switch-bot-toggle"
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Current Strategy</p>
            <p className="text-base font-semibold" data-testid="text-strategy-name">{stats.strategyName}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Trades Today</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-trades-today">{stats.tradesToday}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold font-mono text-chart-3" data-testid="text-success-rate">{stats.successRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Positions</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-active-positions">{stats.activePositions}</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onConfigure} 
          variant="outline" 
          className="w-full"
          data-testid="button-configure-strategy"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure Strategy
        </Button>
      </div>
    </Card>
  );
}
