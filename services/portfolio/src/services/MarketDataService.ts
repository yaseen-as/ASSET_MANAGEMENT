import axios from 'axios';
import ApiError from '../utils/ApiError';

export class MarketDataService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MARKET_SERVICE_URL || 'http://market-service:3003';
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    if (!symbol) {
      throw ApiError.badRequest('Stock symbol is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/market/price/${symbol}`);
      
      if (!response.data || !response.data.data) {
        throw ApiError.serviceUnavailable('Market data service returned invalid response');
      }

      return response.data.data.price || 100; // Default price if service unavailable
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.error(`Market service unavailable for ${symbol}`);
          // Return mock price when service is unavailable
          return 100 + Math.random() * 1000;
        }
        
        if (error.response?.status === 404) {
          throw ApiError.notFound(`Stock symbol '${symbol}' not found`);
        }
        
        if (error.response?.status && error.response.status >= 500) {
          throw ApiError.serviceUnavailable('Market data service error');
        }
      }

      console.error(`Failed to fetch price for ${symbol}:`, error);
      // Return a mock price for other errors
      return 100 + Math.random() * 1000;
    }
  }

  async getHistoricalData(symbol: string) {
    if (!symbol) {
      throw ApiError.badRequest('Stock symbol is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/market/history/${symbol}`);
      
      if (!response.data || !response.data.data) {
        throw ApiError.serviceUnavailable('Market data service returned invalid response');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          console.error(`Market service unavailable for ${symbol} historical data`);
          return []; // Return empty array when service is unavailable
        }
        
        if (error.response?.status === 404) {
          throw ApiError.notFound(`Historical data for symbol '${symbol}' not found`);
        }
        
        if (error.response?.status && error.response.status >= 500) {
          throw ApiError.serviceUnavailable('Market data service error');
        }
      }

      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      return []; // Return empty array for other errors
    }
  }
}
