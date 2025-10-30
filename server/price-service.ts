// Bitcoin price service using CoinGecko API or Exchange APIs
import { storage } from "./storage";

interface BitcoinPrice {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

interface HistoricalDataPoint {
  timestamp: number;
  price: number;
}

class PriceService {
  private currentPrice: BitcoinPrice | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private activeExchange: string | null = null;

  async fetchPrice(): Promise<BitcoinPrice> {
    try {
      // Check for any active exchange credentials (from any user)
      const activeCredential = await storage.getAnyActiveCredential();

      if (activeCredential) {
        // Use exchange API
        console.log(`🔄 Fetching price from ${activeCredential.exchange.toUpperCase()}${activeCredential.exchangeUrl ? ` (Custom URL: ${activeCredential.exchangeUrl})` : ' (Default URL)'}`);
        return await this.fetchFromExchange(activeCredential.exchange, activeCredential.exchangeUrl);
      } else {
        // Use CoinGecko as fallback
        console.log('🔄 No active exchange credentials found, fetching from CoinGecko');
        return await this.fetchFromCoinGecko();
      }
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      
      // Return mock data if API fails
      if (!this.currentPrice) {
        this.currentPrice = {
          price: 67842.50,
          change24h: 3.25,
          high24h: 68420.00,
          low24h: 66100.00,
          timestamp: Date.now(),
        };
      }
      
      return this.currentPrice;
    }
  }

  private async fetchFromCoinGecko(): Promise<BitcoinPrice> {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_high_low=true';
    console.log(`📡 Calling CoinGecko API: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price from CoinGecko');
    }

    const data = await response.json();
    const btcData = data.bitcoin;

    this.currentPrice = {
      price: btcData.usd,
      change24h: btcData.usd_24h_change || 0,
      high24h: btcData.usd_24h_high || btcData.usd,
      low24h: btcData.usd_24h_low || btcData.usd,
      timestamp: Date.now(),
    };
    this.activeExchange = 'coingecko';

    return this.currentPrice;
  }

  private async fetchFromExchange(exchange: string, customUrl?: string | null): Promise<BitcoinPrice> {
    switch (exchange.toLowerCase()) {
      case 'binance':
        return await this.fetchFromBinance(customUrl);
      case 'bitget':
        return await this.fetchFromBitget(customUrl);
      case 'coinbase':
        return await this.fetchFromCoinbase(customUrl);
      case 'kraken':
        return await this.fetchFromKraken(customUrl);
      case 'bybit':
        return await this.fetchFromBybit(customUrl);
      default:
        console.warn(`Unknown exchange: ${exchange}, falling back to CoinGecko`);
        return await this.fetchFromCoinGecko();
    }
  }

  private async fetchFromBinance(customUrl?: string | null): Promise<BitcoinPrice> {
    const baseUrl = customUrl || 'https://api.binance.com/api/v3';
    const fullUrl = `${baseUrl}/ticker/24hr?symbol=BTCUSDT`;
    
    console.log(`📡 Calling Binance API: ${fullUrl}`);
    
    // Get 24h ticker for BTC/USDT
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Binance API Error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch price from Binance: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log(`✅ Binance API Response: Price=${data.lastPrice}, Change=${data.priceChangePercent}%`);

    this.currentPrice = {
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      timestamp: Date.now(),
    };
    this.activeExchange = 'binance';

    return this.currentPrice;
  }

  private async fetchFromBitget(customUrl?: string | null): Promise<BitcoinPrice> {
    const baseUrl = customUrl || 'https://api.bitget.com/api/v2';
    
    // Get ticker for BTC/USDT
    const response = await fetch(`${baseUrl}/spot/market/tickers?symbol=BTCUSDT`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price from Bitget');
    }

    const data = await response.json();
    const ticker = data.data?.[0];

    if (!ticker) {
      throw new Error('No ticker data from Bitget');
    }

    this.currentPrice = {
      price: parseFloat(ticker.lastPr),
      change24h: parseFloat(ticker.changeUtc24h || ticker.change24h || 0),
      high24h: parseFloat(ticker.high24h),
      low24h: parseFloat(ticker.low24h),
      timestamp: Date.now(),
    };
    this.activeExchange = 'bitget';

    return this.currentPrice;
  }

  private async fetchFromCoinbase(customUrl?: string | null): Promise<BitcoinPrice> {
    const baseUrl = customUrl || 'https://api.exchange.coinbase.com';
    
    // Get 24h stats for BTC-USD
    const response = await fetch(`${baseUrl}/products/BTC-USD/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price from Coinbase');
    }

    const data = await response.json();
    
    const currentPriceValue = parseFloat(data.last);
    const open = parseFloat(data.open);
    const change24h = ((currentPriceValue - open) / open) * 100;

    this.currentPrice = {
      price: currentPriceValue,
      change24h: change24h,
      high24h: parseFloat(data.high),
      low24h: parseFloat(data.low),
      timestamp: Date.now(),
    };
    this.activeExchange = 'coinbase';

    return this.currentPrice;
  }

  private async fetchFromKraken(customUrl?: string | null): Promise<BitcoinPrice> {
    const baseUrl = customUrl || 'https://api.kraken.com/0/public';
    
    // Get ticker for XBT/USD (Kraken uses XBT instead of BTC)
    const response = await fetch(`${baseUrl}/Ticker?pair=XBTUSD`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price from Kraken');
    }

    const data = await response.json();
    const ticker = data.result?.XXBTZUSD;

    if (!ticker) {
      throw new Error('No ticker data from Kraken');
    }

    const currentPriceValue = parseFloat(ticker.c[0]); // Last trade price
    const open = parseFloat(ticker.o); // Today's opening price
    const change24h = ((currentPriceValue - open) / open) * 100;

    this.currentPrice = {
      price: currentPriceValue,
      change24h: change24h,
      high24h: parseFloat(ticker.h[0]), // High last 24h
      low24h: parseFloat(ticker.l[0]), // Low last 24h
      timestamp: Date.now(),
    };
    this.activeExchange = 'kraken';

    return this.currentPrice;
  }

  private async fetchFromBybit(customUrl?: string | null): Promise<BitcoinPrice> {
    const baseUrl = customUrl || 'https://api.bybit.com/v5';
    
    // Get ticker for BTC/USDT
    const response = await fetch(`${baseUrl}/market/tickers?category=spot&symbol=BTCUSDT`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price from Bybit');
    }

    const data = await response.json();
    const ticker = data.result?.list?.[0];

    if (!ticker) {
      throw new Error('No ticker data from Bybit');
    }

    this.currentPrice = {
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.price24hPcnt) * 100, // Convert to percentage
      high24h: parseFloat(ticker.highPrice24h),
      low24h: parseFloat(ticker.lowPrice24h),
      timestamp: Date.now(),
    };
    this.activeExchange = 'bybit';

    return this.currentPrice;
  }

  getCurrentPrice(): BitcoinPrice | null {
    return this.currentPrice;
  }

  getActiveExchange(): string | null {
    return this.activeExchange;
  }

  startPriceUpdates(intervalMs: number = 60000) {
    // Initial fetch
    this.fetchPrice();
    
    // Update every intervalMs (default 1 minute)
    this.updateInterval = setInterval(() => {
      this.fetchPrice();
    }, intervalMs);
  }

  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async fetchHistoricalPrices(days: number = 90): Promise<HistoricalDataPoint[]> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical prices');
      }

      const data = await response.json();
      
      // CoinGecko returns prices as array of [timestamp, price]
      return data.prices.map((item: [number, number]) => ({
        timestamp: item[0],
        price: item[1],
      }));
    } catch (error) {
      console.error('Error fetching historical Bitcoin prices:', error);
      
      // Return mock data if API fails
      const mockData: HistoricalDataPoint[] = [];
      let price = 65000;
      const now = Date.now();
      
      for (let i = 0; i <= days; i++) {
        const timestamp = now - ((days - i) * 86400000);
        price = price + (Math.random() - 0.5) * 2000;
        mockData.push({
          timestamp,
          price: Math.round(price),
        });
      }
      
      return mockData;
    }
  }
}

export const priceService = new PriceService();
