import { useQuery } from '@tanstack/react-query';
import { marketAPI } from '../services/api';

export interface StockPrice {
  symbol: string;
  price: number;
  timestamp: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  history: HistoricalDataPoint[];
}

export const useStockPrice = (symbol: string) => {
  return useQuery({
    queryKey: ['stockPrice', symbol],
    queryFn: async () => {
      const response = await marketAPI.getPrice(symbol);
      return response.data as StockPrice;
    },
    enabled: !!symbol,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Data is fresh for 10 seconds
  });
};

export const useStockHistory = (symbol: string) => {
  return useQuery({
    queryKey: ['stockHistory', symbol],
    queryFn: async () => {
      const response = await marketAPI.getHistory(symbol);
      return response.data as HistoricalData;
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // Historical data is fresh for 5 minutes
  });
};

// Hook for multiple stock prices (for market overview)
export const useMarketOverview = () => {
  const popularStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK', 'WIPRO', 'HDFCBANK', 'ITC'];
  
  const queries = popularStocks.map(symbol => ({
    queryKey: ['stockPrice', symbol],
    queryFn: async () => {
      try {
        const response = await marketAPI.getPrice(symbol);
        return response.data as StockPrice;
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error);
        return { symbol, price: 0, timestamp: new Date().toISOString() };
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
  }));

  return useQuery({
    queryKey: ['marketOverview'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        popularStocks.map(symbol => marketAPI.getPrice(symbol))
      );
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value.data as StockPrice;
        } else {
          return {
            symbol: popularStocks[index],
            price: 0,
            timestamp: new Date().toISOString(),
          } as StockPrice;
        }
      });
    },
    refetchInterval: 60000, // Refresh every minute for overview
    staleTime: 30000,
  });
};

// Hook for indices (NIFTY, SENSEX)
export const useMarketIndices = () => {
  const indices = ['NIFTY50', 'SENSEX', 'BANKNIFTY'];
  
  return useQuery({
    queryKey: ['marketIndices'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        indices.map(index => marketAPI.getPrice(index))
      );
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value.data as StockPrice;
        } else {
          return {
            symbol: indices[index],
            price: 0,
            timestamp: new Date().toISOString(),
          } as StockPrice;
        }
      });
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000,
  });
};