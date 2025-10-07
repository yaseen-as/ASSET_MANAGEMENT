import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMeAPI } from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // On mount, fetch user info from cookie
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeAPI();
      setUser(data.user);
    } catch (err: any) {
      setUser(null);
      setError(err?.message || 'Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setError(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, setUser, setError, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
