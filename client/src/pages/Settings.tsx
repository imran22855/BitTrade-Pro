import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Check, X, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import { MessageCircle, Bell, Send, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { toast } = useToast();
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExchange, setNewExchange] = useState('binance');
  const [newApiKey, setNewApiKey] = useState('');
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newExchangeUrl, setNewExchangeUrl] = useState('');

  // Notification state
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [smsNumber, setSmsNumber] = useState('');

  const { data: credentials, isLoading: credsLoading } = useQuery({
    queryKey: ['/api/exchange-credentials'],
  });

  const { data: notificationSettings, isLoading: notifLoading } = useQuery({
    queryKey: ['/api/notification-settings'],
  });

  const addCredentialMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/exchange-credentials', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exchange-credentials'] });
      setNewApiKey('');
      setNewSecretKey('');
      setNewExchangeUrl('');
      setIsDialogOpen(false);
      toast({ title: "Exchange Added", description: "Exchange credentials saved successfully." });
    },
  });

  const updateCredentialMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest(`/api/exchange-credentials/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exchange-credentials'] });
      toast({ title: "Updated", description: "Exchange credential updated." });
    },
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/exchange-credentials/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exchange-credentials'] });
      toast({ title: "Removed", description: "Exchange credential removed." });
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest('/api/notification-settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-settings'] });
    },
  });

  const exchanges = [
    { value: 'binance', label: 'Binance' },
    { value: 'bitget', label: 'Bitget' },
    { value: 'coinbase', label: 'Coinbase Pro' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'bybit', label: 'Bybit' },
  ];

  const handleAddCredential = () => {
    addCredentialMutation.mutate({
      exchange: newExchange,
      apiKey: newApiKey,
      secretKey: newSecretKey,
      exchangeUrl: newExchangeUrl || null,
      isActive: false,
    });
  };

  const toggleSecret = (id: string) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const configureTelegram = async () => {
    if (telegramBotToken && telegramChatId) {
      await updateNotificationMutation.mutateAsync({
        telegram: { enabled: true, botToken: telegramBotToken, chatId: telegramChatId }
      });
      toast({ title: "Telegram Configured", description: "Telegram notifications enabled." });
    }
  };

  const configureWhatsApp = async () => {
    if (whatsappNumber) {
      await updateNotificationMutation.mutateAsync({
        whatsapp: { enabled: true, number: whatsappNumber }
      });
      toast({ title: "WhatsApp Configured", description: "WhatsApp notifications enabled." });
    }
  };

  const configureSMS = async () => {
    if (smsNumber) {
      await updateNotificationMutation.mutateAsync({
        sms: { enabled: true, number: smsNumber }
      });
      toast({ title: "SMS Configured", description: "SMS notifications enabled." });
    }
  };

  const toggleAlertType = async (type: string, value: boolean) => {
    await updateNotificationMutation.mutateAsync({
      alertTypes: {
        ...notificationSettings?.alertTypes,
        [type]: value,
      }
    });
  };

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
          {credsLoading ? (
            <Card className="p-6">
              <Skeleton className="h-64 w-full" />
            </Card>
          ) : (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Exchange API Credentials</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect your exchange accounts to enable live trading
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-exchange">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exchange
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Exchange Credentials</DialogTitle>
                        <DialogDescription>
                          Enter your API credentials from the exchange. Make sure to enable trading permissions.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="exchange-select">Exchange</Label>
                          <Select value={newExchange} onValueChange={setNewExchange}>
                            <SelectTrigger id="exchange-select" data-testid="select-exchange">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {exchanges.map(ex => (
                                <SelectItem key={ex.value} value={ex.value}>
                                  {ex.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exchange-url">Custom Exchange URL (Optional)</Label>
                          <Input
                            id="exchange-url"
                            value={newExchangeUrl}
                            onChange={(e) => setNewExchangeUrl(e.target.value)}
                            placeholder="e.g., https://testnet.binance.vision/api"
                            data-testid="input-exchange-url"
                          />
                          <p className="text-xs text-muted-foreground">
                            Leave blank to use default production URL. Use testnet or custom endpoints for development.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="api-key">API Key</Label>
                          <Input
                            id="api-key"
                            value={newApiKey}
                            onChange={(e) => setNewApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            data-testid="input-api-key"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secret-key">Secret Key</Label>
                          <Input
                            id="secret-key"
                            type="password"
                            value={newSecretKey}
                            onChange={(e) => setNewSecretKey(e.target.value)}
                            placeholder="Enter your secret key"
                            data-testid="input-secret-key"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddCredential}
                          disabled={!newApiKey || !newSecretKey}
                          data-testid="button-save-credentials"
                        >
                          Save Credentials
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {credentials && credentials.length > 0 ? (
                    credentials.map((cred: any) => (
                      <Card key={cred.id} className="p-4" data-testid={`card-exchange-${cred.id}`}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {cred.exchange.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold capitalize">{cred.exchange}</h4>
                                <Badge variant={cred.isActive ? "default" : "secondary"} className="mt-1">
                                  {cred.isActive ? (
                                    <><Check className="h-3 w-3 mr-1" /> Active</>
                                  ) : (
                                    <><X className="h-3 w-3 mr-1" /> Inactive</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCredentialMutation.mutate({
                                  id: cred.id,
                                  updates: { isActive: !cred.isActive }
                                })}
                                data-testid={`button-toggle-${cred.id}`}
                              >
                                {cred.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteCredentialMutation.mutate(cred.id)}
                                data-testid={`button-remove-${cred.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {cred.exchangeUrl && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Custom Exchange URL</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                                    {cred.exchangeUrl}
                                  </code>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">API Key</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                                    {cred.apiKey}
                                  </code>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Secret Key</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                                    {showSecret[cred.id] ? cred.secretKey : '••••••••••••••••••••'}
                                  </code>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => toggleSecret(cred.id)}
                                    data-testid={`button-toggle-secret-${cred.id}`}
                                  >
                                    {showSecret[cred.id] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No exchange credentials added yet. Add your first exchange to start live trading.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          {notifLoading ? (
            <Card className="p-6">
              <Skeleton className="h-64 w-full" />
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Alert Types
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose which events trigger notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Price Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified when price targets are hit
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings?.alertTypes?.priceAlerts ?? true}
                        onCheckedChange={(checked) => toggleAlertType('priceAlerts', checked)}
                        data-testid="switch-price-alerts"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Trade Executions</p>
                        <p className="text-sm text-muted-foreground">
                          Notify on each buy/sell trade
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings?.alertTypes?.tradeExecutions ?? true}
                        onCheckedChange={(checked) => toggleAlertType('tradeExecutions', checked)}
                        data-testid="switch-trade-alerts"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bot Status Changes</p>
                        <p className="text-sm text-muted-foreground">
                          Alert when bot starts/stops
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings?.alertTypes?.botStatus ?? true}
                        onCheckedChange={(checked) => toggleAlertType('botStatus', checked)}
                        data-testid="switch-bot-status-alerts"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Daily Summary</p>
                        <p className="text-sm text-muted-foreground">
                          Receive end-of-day performance report
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings?.alertTypes?.dailySummary ?? false}
                        onCheckedChange={(checked) => toggleAlertType('dailySummary', checked)}
                        data-testid="switch-daily-summary"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Services</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Configure notification channels (coming soon in production mode)
                  </p>
                  <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    Note: Telegram, WhatsApp, and SMS integrations will be available when you upgrade to live trading mode. 
                    Configure your preferred notification channels here to receive real-time trading alerts.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
