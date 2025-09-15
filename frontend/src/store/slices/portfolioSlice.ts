import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { portfolioAPI } from '../../services/api';

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  exchange: 'NSE' | 'BSE';
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioState {
  holdings: Holding[];
  totalValue: number;
  totalPnl: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  holdings: [],
  totalValue: 0,
  totalPnl: 0,
  isLoading: false,
  error: null,
};

export const fetchPortfolioAsync = createAsyncThunk(
  'portfolio/fetchPortfolio',
  async () => {
    const response = await portfolioAPI.getPortfolio();
    return response;
  }
);

export const addHolding = createAsyncThunk(
  'portfolio/addHolding',
  async (holding: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await portfolioAPI.addHolding(holding);
    return response;
  }
);

export const updateHolding = createAsyncThunk(
  'portfolio/updateHolding',
  async ({ id, holding }: { id: string; holding: Partial<Holding> }) => {
    const response = await portfolioAPI.updateHolding(id, holding);
    return response;
  }
);

export const deleteHolding = createAsyncThunk(
  'portfolio/deleteHolding',
  async (id: string) => {
    await portfolioAPI.deleteHolding(id);
    return id;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addHolding: (state, action) => {
      state.holdings.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolioAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.holdings = action.payload.holdings || [];
        
        // Calculate totals
        state.totalValue = state.holdings.reduce((total, holding) => 
          total + (holding.currentPrice * holding.quantity), 0);
        
        state.totalPnl = state.holdings.reduce((total, holding) => 
          total + ((holding.currentPrice - holding.avgPrice) * holding.quantity), 0);
      })
      .addCase(fetchPortfolioAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch portfolio';
      });
  },
});

export const { clearError } = portfolioSlice.actions;
export default portfolioSlice.reducer;
