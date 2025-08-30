import axios from 'axios';

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class AngelOneService {
  private apiKey: string;
  private clientId: string;
  private baseUrl: string = 'https://apiconnect.angelbroking.com';

  constructor() {
    this.apiKey = process.env.ANGEL_ONE_API_KEY || '';
    this.clientId = process.env.ANGEL_ONE_CLIENT_ID || '';
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      if (!this.apiKey || !this.clientId) {
        // Return mock data if API credentials not available
        return this.getMockPrice(symbol);
      }

      // TODO: Implement actual Angel One API integration
      // For now, return mock data
      return this.getMockPrice(symbol);
      
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return this.getMockPrice(symbol);
    }
  }

  async getHistoricalData(symbol: string): Promise<HistoricalData[]> {
    try {
      if (!this.apiKey || !this.clientId) {
        // Return mock data if API credentials not available
        return this.getMockHistoricalData(symbol);
      }

      // TODO: Implement actual Angel One API integration
      // For now, return mock data
      return this.getMockHistoricalData(symbol);
      
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      return this.getMockHistoricalData(symbol);
    }
  }

  private getMockPrice(symbol: string): number {
    // Generate realistic mock prices based on symbol
    const basePrice = this.getBasePriceForSymbol(symbol);
    const variation = (Math.random() - 0.5) * basePrice * 0.05; // ±5% variation
    return Math.round((basePrice + variation) * 100) / 100;
  }

  private getMockHistoricalData(symbol: string): HistoricalData[] {
    const data: HistoricalData[] = [];
    const basePrice = this.getBasePriceForSymbol(symbol);
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * basePrice * 0.03;
      const price = basePrice + variation;
      const volatility = price * 0.02;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: Math.round((price + (Math.random() - 0.5) * volatility) * 100) / 100,
        high: Math.round((price + Math.random() * volatility) * 100) / 100,
        low: Math.round((price - Math.random() * volatility) * 100) / 100,
        close: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1000000),
      });
    }
    
    return data;
  }

  private getBasePriceForSymbol(symbol: string): number {
    // Generate different base prices for different symbols
    const symbolMap: { [key: string]: number } = {
      'RELIANCE': 2500,
      'TCS': 3200,
      'HDFCBANK': 1600,
      'INFY': 1400,
      'ICICIBANK': 900,
      'ITC': 450,
      'KOTAKBANK': 1800,
      'LT': 2200,
      'AXISBANK': 1100,
      'BHARTIARTL': 800,
    };

    return symbolMap[symbol] || 500 + (symbol.charCodeAt(0) % 26) * 50;
  }
}
