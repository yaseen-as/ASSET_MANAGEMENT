import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL as string;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { token } = response.data;
        localStorage.setItem('token', token);
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  refresh: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export const portfolioAPI = {
  getPortfolio: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },
  
  addHolding: async (holding: any) => {
    const response = await api.post('/portfolio', holding);
    return response.data;
  },
  
  updateHolding: async (id: string, holding: any) => {
    const response = await api.put(`/portfolio/${id}`, holding);
    return response.data;
  },
  
  deleteHolding: async (id: string) => {
    const response = await api.delete(`/portfolio/${id}`);
    return response.data;
  },
  
  syncPortfolio: async () => {
    const response = await api.post('/portfolio/sync');
    return response.data;
  },
};

export const marketAPI = {
  getPrice: async (symbol: string) => {
    const response = await api.get(`/market/price/${symbol}`);
    return response.data;
  },
  
  getHistory: async (symbol: string) => {
    const response = await api.get(`/market/history/${symbol}`);
    return response.data;
  },
};

export default api;
