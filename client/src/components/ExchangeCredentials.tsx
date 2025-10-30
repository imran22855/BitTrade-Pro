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
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Check, X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExchangeCredential {
  id: string;
  exchange: string;
  apiKey: string;
  secretKey: string;
  isActive: boolean;
}

export function ExchangeCredentials() {
  const [credentials, setCredentials] = useState<ExchangeCredential[]>([
    // todo: remove mock functionality
    {
      id: '1',
      exchange: 'binance',
      apiKey: 'bnc_xxxxxxxxxxxxxxxxxxxx',
      secretKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
      isActive: true
    }
  ]);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExchange, setNewExchange] = useState('binance');
  const [newApiKey, setNewApiKey] = useState('');
  const [newSecretKey, setNewSecretKey] = useState('');

  const exchanges = [
    { value: 'binance', label: 'Binance' },
    { value: 'bitget', label: 'Bitget' },
    { value: 'coinbase', label: 'Coinbase Pro' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'bybit', label: 'Bybit' },
  ];

  const toggleSecret = (id: string) => {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCredential = () => {
    const newCredential: ExchangeCredential = {
      id: Date.now().toString(),
      exchange: newExchange,
      apiKey: newApiKey,
      secretKey: newSecretKey,
      isActive: false
    };
    setCredentials([...credentials, newCredential]);
    setNewApiKey('');
    setNewSecretKey('');
    setIsDialogOpen(false);
    console.log('Added credential:', newCredential);
  };

  const handleRemoveCredential = (id: string) => {
    setCredentials(credentials.filter(c => c.id !== id));
    console.log('Removed credential:', id);
  };

  const toggleActive = (id: string) => {
    setCredentials(credentials.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  return (
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
          {credentials.map((cred) => (
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
                      onClick={() => toggleActive(cred.id)}
                      data-testid={`button-toggle-${cred.id}`}
                    >
                      {cred.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveCredential(cred.id)}
                      data-testid={`button-remove-${cred.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
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
            </Card>
          ))}
          
          {credentials.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No exchange credentials added yet. Add your first exchange to start live trading.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
}
