import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExchangeCredentials } from "@/components/ExchangeCredentials";
import { NotificationConfig } from "@/components/NotificationConfig";

export default function Settings() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure exchange connections and notification preferences
        </p>
      </div>

      <Tabs defaultValue="exchanges" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="exchanges" data-testid="tab-exchanges">
            Exchange Credentials
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges">
          <ExchangeCredentials />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
