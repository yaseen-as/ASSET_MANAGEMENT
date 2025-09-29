import axios from 'axios';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL as string;

// Debug environment variables
console.log('🔍 Environment Debug:', {
  'import.meta.env.VITE_REACT_APP_API_URL': import.meta.env.VITE_REACT_APP_API_URL,
  'process.env.VITE_REACT_APP_API_URL': (window as any).process?.env?.VITE_REACT_APP_API_URL,
  'All Vite Env Vars': Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
  'Current API_BASE_URL': API_BASE_URL
});

// Validate API base URL
if (!API_BASE_URL) {
  console.error('❌ VITE_REACT_APP_API_URL is not defined in environment variables');
  console.error('📋 Available environment variables:', import.meta.env);
  throw new Error('API Base URL is required');
}

// Ensure we don't use Docker container names in browser
if (API_BASE_URL.includes('nginx-dev') || API_BASE_URL.includes('localhost:80')) {
  console.warn('⚠️ Potentially incorrect API URL detected:', API_BASE_URL);
}

console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.MODE,
  debug: import.meta.env.VITE_DEBUG_API
});

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
  withCredentials: false, // Set to false for CORS simplicity initially
});

// Request interceptor to add auth token and debug logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      console.log(`🔄 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log('📋 Headers:', config.headers);
      if (config.data) {
        console.log('📦 Data:', config.data);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_DEBUG_API === 'true') {
      console.log(`✅ [API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('📄 Response:', response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ [API Error] ${error.response?.status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
    console.error('📄 Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('🔄 [Token Refresh] Attempting token refresh...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log('✅ [Token Refresh] Token refreshed, retrying request');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ [Token Refresh] Failed:', refreshError);
      }
      
      // Clear auth data and redirect to login
      console.log('🚪 [Auth] Clearing authentication data and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  signup: async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/signup', { email, password, name });
      return response.data;
    } catch (error: any) {
      console.error('Signup API error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      console.error('Logout API error:', error);
      throw error;
    }
  },
  
  refresh: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      console.error('Refresh API error:', error);
      throw error;
    }
  },
  
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error: any) {
      console.error('Token validation error:', error);
      throw error;
    }
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
