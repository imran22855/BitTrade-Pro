// Bitcoin price service using CoinGecko API
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

  async fetchPrice(): Promise<BitcoinPrice> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_high_low=true'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch price');
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

      return this.currentPrice;
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

  getCurrentPrice(): BitcoinPrice | null {
    return this.currentPrice;
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
