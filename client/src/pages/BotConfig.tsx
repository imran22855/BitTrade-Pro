import { StrategyConfig } from "@/components/StrategyConfig";
import { useToast } from "@/hooks/use-toast";

export default function BotConfig() {
  const { toast } = useToast();

  const handleSave = (config: any) => {
    console.log('Strategy saved:', config);
    toast({
      title: "Configuration Saved",
      description: "Your trading strategy has been saved successfully.",
    });
  };

  const handleStart = () => {
    console.log('Bot started');
    toast({
      title: "Bot Started",
      description: "Your trading bot is now active and monitoring the market.",
    });
  };

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
