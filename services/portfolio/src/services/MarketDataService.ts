import axios from 'axios';

export class MarketDataService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MARKET_SERVICE_URL || 'http://market-service:3003';
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/market/price/${symbol}`);
      return response.data.data.price || 100; // Default price if service unavailable
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      // Return a mock price for now
      return 100 + Math.random() * 1000;
    }
  }

  async getHistoricalData(symbol: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/market/history/${symbol}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      return [];
    }
  }
}
