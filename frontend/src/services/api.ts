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
  withCredentials: true, // Enable cookie-based auth
});

// Request interceptor to add auth token and debug logging
// No token management needed for cookie-based auth
api.interceptors.request.use(
  (config) => {
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
    return Promise.reject(error);
  }
);


// Cookie-based auth API functions for TanStack Query
export async function loginAPI(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function signupAPI(email: string, password: string, name: string) {
  const response = await api.post('/auth/signup', { email, password, name });
  return response.data;
}

export async function logoutAPI() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function refreshAPI() {
  const response = await api.post('/auth/refresh');
  return response.data;
}

export async function getMeAPI() {
  const response = await api.get('/auth/me');
  return response.data;
}

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
