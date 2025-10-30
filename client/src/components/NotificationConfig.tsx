import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bell, CheckCircle2 } from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import { useState } from "react";

interface NotificationService {
  id: string;
  name: string;
  type: 'telegram' | 'whatsapp' | 'sms';
  enabled: boolean;
  configured: boolean;
  icon: any;
}

export function NotificationConfig() {
  const [services, setServices] = useState<NotificationService[]>([
    {
      id: 'telegram',
      name: 'Telegram',
      type: 'telegram',
      enabled: false,
      configured: false,
      icon: SiTelegram
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      type: 'whatsapp',
      enabled: false,
      configured: false,
      icon: SiWhatsapp
    },
    {
      id: 'sms',
      name: 'SMS (Twilio)',
      type: 'sms',
      enabled: false,
      configured: false,
      icon: MessageCircle
    }
  ]);

  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [smsNumber, setSmsNumber] = useState('');

  const [alertSettings, setAlertSettings] = useState({
    priceAlerts: true,
    tradeExecutions: true,
    botStatus: true,
    dailySummary: false,
  });

  const toggleService = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const configureTelegram = () => {
    if (telegramBotToken && telegramChatId) {
      setServices(services.map(s => 
        s.id === 'telegram' ? { ...s, configured: true, enabled: true } : s
      ));
      console.log('Telegram configured:', { telegramBotToken, telegramChatId });
    }
  };

  const configureWhatsApp = () => {
    if (whatsappNumber) {
      setServices(services.map(s => 
        s.id === 'whatsapp' ? { ...s, configured: true, enabled: true } : s
      ));
      console.log('WhatsApp configured:', whatsappNumber);
    }
  };

  const configureSMS = () => {
    if (smsNumber) {
      setServices(services.map(s => 
        s.id === 'sms' ? { ...s, configured: true, enabled: true } : s
      ));
      console.log('SMS configured:', smsNumber);
    }
  };

  const testNotification = (serviceId: string) => {
    console.log('Testing notification for:', serviceId);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Notification Services</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure notification channels to receive trading alerts
            </p>
          </div>

          <div className="space-y-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="p-4" data-testid={`card-service-${service.id}`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          {service.configured ? (
                            <Badge variant="default" className="mt-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Configured
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="mt-1">
                              Not Configured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={service.enabled}
                        onCheckedChange={() => toggleService(service.id)}
                        disabled={!service.configured}
                        data-testid={`switch-${service.id}`}
                      />
                    </div>

                    {service.id === 'telegram' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="telegram-bot-token">Bot Token</Label>
                          <Input
                            id="telegram-bot-token"
                            value={telegramBotToken}
                            onChange={(e) => setTelegramBotToken(e.target.value)}
                            placeholder="Enter Telegram bot token"
                            data-testid="input-telegram-token"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telegram-chat-id">Chat ID</Label>
                          <Input
                            id="telegram-chat-id"
                            value={telegramChatId}
                            onChange={(e) => setTelegramChatId(e.target.value)}
                            placeholder="Enter your chat ID"
                            data-testid="input-telegram-chat"
                          />
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                          <Button 
                            onClick={configureTelegram}
                            disabled={!telegramBotToken || !telegramChatId}
                            data-testid="button-configure-telegram"
                          >
                            Configure
                          </Button>
                          {service.configured && (
                            <Button 
                              variant="outline"
                              onClick={() => testNotification('telegram')}
                              data-testid="button-test-telegram"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Test
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {service.id === 'whatsapp' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                          <Input
                            id="whatsapp-number"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="+1234567890"
                            data-testid="input-whatsapp-number"
                          />
                          <p className="text-xs text-muted-foreground">
                            Include country code (e.g., +1 for US)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={configureWhatsApp}
                            disabled={!whatsappNumber}
                            data-testid="button-configure-whatsapp"
                          >
                            Configure
                          </Button>
                          {service.configured && (
                            <Button 
                              variant="outline"
                              onClick={() => testNotification('whatsapp')}
                              data-testid="button-test-whatsapp"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Test
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {service.id === 'sms' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="sms-number">Phone Number</Label>
                          <Input
                            id="sms-number"
                            value={smsNumber}
                            onChange={(e) => setSmsNumber(e.target.value)}
                            placeholder="+1234567890"
                            data-testid="input-sms-number"
                          />
                          <p className="text-xs text-muted-foreground">
                            SMS notifications via Twilio
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={configureSMS}
                            disabled={!smsNumber}
                            data-testid="button-configure-sms"
                          >
                            Configure
                          </Button>
                          {service.configured && (
                            <Button 
                              variant="outline"
                              onClick={() => testNotification('sms')}
                              data-testid="button-test-sms"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Test
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

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
                checked={alertSettings.priceAlerts}
                onCheckedChange={(checked) => 
                  setAlertSettings({ ...alertSettings, priceAlerts: checked })
                }
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
                checked={alertSettings.tradeExecutions}
                onCheckedChange={(checked) => 
                  setAlertSettings({ ...alertSettings, tradeExecutions: checked })
                }
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
                checked={alertSettings.botStatus}
                onCheckedChange={(checked) => 
                  setAlertSettings({ ...alertSettings, botStatus: checked })
                }
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
                checked={alertSettings.dailySummary}
                onCheckedChange={(checked) => 
                  setAlertSettings({ ...alertSettings, dailySummary: checked })
                }
                data-testid="switch-daily-summary"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
