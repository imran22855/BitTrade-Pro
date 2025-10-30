import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Play, Square, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import type { StrategyEvent } from "@shared/schema";

interface StrategyEventsProps {
  strategyId: string | null;
}

export function StrategyEvents({ strategyId }: StrategyEventsProps) {
  const { data: events, isLoading } = useQuery<StrategyEvent[]>({
    queryKey: strategyId ? ['/api/strategies', strategyId, 'events'] : ['strategy-events-disabled'],
    enabled: !!strategyId,
  });

  if (!strategyId) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Strategy Event Log</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No strategy selected. Save a strategy to view its event log.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Strategy Event Log</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading events...</p>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Strategy Event Log</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No events yet. Start the strategy to begin logging.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Strategy Event Log</h3>
        <Badge variant="secondary" className="ml-auto" data-testid="badge-event-count">
          {events.length} events
        </Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 p-3 rounded-lg border bg-card hover-elevate"
              data-testid={`event-${event.eventType}-${event.id}`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                event.eventType === 'started' 
                  ? 'bg-chart-3/10 text-chart-3' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {event.eventType === 'started' ? (
                  <Play className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-semibold text-sm" data-testid="text-event-type">
                      Bot {event.eventType === 'started' ? 'Started' : 'Stopped'}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-strategy-name">
                      {event.eventData?.strategyName || 'Unknown Strategy'}
                    </p>
                  </div>
                  <Badge 
                    variant={event.eventType === 'started' ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                    data-testid="badge-event-status"
                  >
                    {event.eventType === 'started' ? 'Active' : 'Stopped'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-mono font-semibold" data-testid="text-event-time">
                      {format(new Date(event.timestamp), 'MMM d, h:mm:ss a')}
                    </p>
                  </div>
                  {event.eventData?.initialPrice && (
                    <div>
                      <p className="text-muted-foreground">Initial Price</p>
                      <p className="font-mono font-semibold text-chart-3" data-testid="text-initial-price">
                        ${Number(event.eventData.initialPrice).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {event.eventData?.currentPrice && !event.eventData?.initialPrice && (
                    <div>
                      <p className="text-muted-foreground">Final Price</p>
                      <p className="font-mono font-semibold" data-testid="text-current-price">
                        ${Number(event.eventData.currentPrice).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {event.eventData && (event.eventData.gridInterval || event.eventData.profitPercent || event.eventData.tradeSize) && (
                  <div className="mt-2 pt-2 border-t space-y-1 text-xs">
                    {event.eventData.gridInterval && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grid Interval:</span>
                        <span className="font-mono font-semibold" data-testid="text-grid-interval">
                          ${Number(event.eventData.gridInterval).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {event.eventData.profitPercent && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit Target:</span>
                        <span className="font-mono font-semibold text-chart-3" data-testid="text-profit-percent">
                          {event.eventData.profitPercent}%
                        </span>
                      </div>
                    )}
                    {event.eventData.tradeSize && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trade Size:</span>
                        <span className="font-mono font-semibold" data-testid="text-trade-size">
                          {event.eventData.tradeSize}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
