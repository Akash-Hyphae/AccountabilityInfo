import axios from 'axios';

// Ensure baseURL is always empty string so all Axios requests use relative URLs against current origin (/api/...)
export const api = axios.create({
  baseURL: '',
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
      const isAuthRoute = error.config?.url?.includes('/api/auth/login') || error.config?.url?.includes('/api/auth/register') || error.config?.url?.includes('/api/auth/demo');
      if (!isAuthRoute) {
        localStorage.removeItem('accountability_token');
        localStorage.removeItem('accountability_user');
      }
    }
    return Promise.reject(error);
  }
);
