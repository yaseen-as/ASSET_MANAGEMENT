import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioAPI } from '../services/api';
import { showToast } from '../lib/toast';

export interface Holding {
  id: string;
  ticker: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  category: 'SWING' | 'LONG_TERM';
  pnl: number;
  pnlPercentage: number;
  investment: number;
  currentValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  holdings: Holding[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  swingValue: number;
  longTermValue: number;
}

export const usePortfolio = () => {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await portfolioAPI.getPortfolio();
      return response.data as Portfolio;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Data is fresh for 10 seconds
  });
};

export const useAddHolding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: portfolioAPI.addHolding,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      showToast.success('Holding added successfully');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to add holding');
    },
  });
};

export const useUpdateHolding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, holding }: { id: string; holding: any }) =>
      portfolioAPI.updateHolding(id, holding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      showToast.success('Holding updated successfully');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update holding');
    },
  });
};

export const useDeleteHolding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: portfolioAPI.deleteHolding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      showToast.success('Holding deleted successfully');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to delete holding');
    },
  });
};

export const useSyncPortfolio = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: portfolioAPI.syncPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      showToast.success('Portfolio synced successfully');
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to sync portfolio');
    },
  });
};