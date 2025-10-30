// Bitcoin price service using CoinGecko API
interface BitcoinPrice {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
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
}

export const priceService = new PriceService();
