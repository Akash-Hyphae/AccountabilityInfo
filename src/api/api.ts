import axios from 'axios';

// Read live backend URL from environment variables, fallback to empty string if not set
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject stored JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accountability_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthenticated 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If we got unauthorized on a protected route, remove stale token
      const isAuthRoute =
        error.config?.url?.includes('/api/auth/login') ||
        error.config?.url?.includes('/api/auth/register') ||
        error.config?.url?.includes('/api/auth/demo');
      if (!isAuthRoute) {
        localStorage.removeItem('accountability_token');
        localStorage.removeItem('accountability_user');
      }
    }
    return Promise.reject(error);
  }
);