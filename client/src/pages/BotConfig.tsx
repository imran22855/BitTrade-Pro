import { StrategyConfig } from "@/components/StrategyConfig";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function BotConfig() {
  const { toast } = useToast();

  const { data: strategies, isLoading } = useQuery({
    queryKey: ['/api/strategies'],
  });

  const createStrategyMutation = useMutation({
    mutationFn: async (config: any) => {
      const result = await apiRequest('POST', '/api/strategies', config);
      return await result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const result = await apiRequest('PATCH', `/api/strategies/${id}`, updates);
      return await result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });

  const handleSave = async (config: any) => {
    try {
      // Check if we already have a strategy, update it instead of creating new
      const existingStrategy = strategies && strategies.length > 0 ? strategies[0] : null;
      
      if (existingStrategy) {
        await updateStrategyMutation.mutateAsync({
          id: existingStrategy.id,
          updates: config,
        });
      } else {
        await createStrategyMutation.mutateAsync(config);
      }

      toast({
        title: "Configuration Saved",
        description: "Your trading strategy has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save strategy configuration.",
        variant: "destructive",
      });
    }
  };

  const handleStart = async () => {
    try {
      const existingStrategy = strategies && strategies.length > 0 ? strategies[0] : null;
      
      if (!existingStrategy) {
        toast({
          title: "No Strategy",
          description: "Please save a strategy configuration first.",
          variant: "destructive",
        });
        return;
      }

      await updateStrategyMutation.mutateAsync({
        id: existingStrategy.id,
        updates: { isActive: true },
      });

      toast({
        title: "Bot Started",
        description: "Your trading bot is now active and monitoring the market.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start trading bot.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Trading Bot Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Configure your automated trading strategy and risk parameters
          </p>
        </div>
        <Card className="p-6">
          <Skeleton className="h-96 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Trading Bot Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure your automated trading strategy and risk parameters
        </p>
      </div>
      
      <StrategyConfig onSave={handleSave} onStart={handleStart} />
    </div>
  );
}
