import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  updateUserName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('accountability_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accountability_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('accountability_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data.user);
          localStorage.setItem('accountability_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('accountability_token');
          localStorage.removeItem('accountability_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('accountability_token', jwtToken);
    localStorage.setItem('accountability_user', JSON.stringify(userData));
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const res = await api.post('/api/auth/register', { name, email, password, confirmPassword });
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('accountability_token', jwtToken);
    localStorage.setItem('accountability_user', JSON.stringify(userData));
  };

  const loginDemo = async () => {
    const res = await api.post('/api/auth/demo');
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('accountability_token', jwtToken);
    localStorage.setItem('accountability_user', JSON.stringify(userData));
  };

  const logout = () => {
    try {
      api.post('/api/auth/logout').catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accountability_token');
      localStorage.removeItem('accountability_user');
    }
  };

  const updateUserName = async (name: string) => {
    const res = await api.put('/api/settings/profile', { name });
    if (res.data.user) {
      setUser(prev => prev ? { ...prev, name: res.data.user.name } : null);
      if (user) {
        localStorage.setItem('accountability_user', JSON.stringify({ ...user, name: res.data.user.name }));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginDemo, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
