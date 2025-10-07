import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginAPI, signupAPI, refreshAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useLoginMutation() {
  const { setUser, setError, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      await loginAPI(data.email, data.password); // cookie set by backend
      await refreshUser();
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      setError(err?.message || 'Login failed');
    },
  });
}

export function useSignupMutation() {
  const { setUser, setError, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      await signupAPI(data.email, data.password, data.name); // cookie set by backend
      await refreshUser();
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      setError(err?.message || 'Signup failed');
    },
  });
}

export function useRefreshMutation() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: async () => {
      await refreshAPI();
      await refreshUser();
    },
  });
}
