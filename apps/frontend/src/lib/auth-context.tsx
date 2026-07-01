'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from './api-client';
import type { User, Tenant } from '../types/api';

interface AuthState {
  user: (User & { tenant: Tenant }) | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, tenantName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  const setAuth = useCallback((token: string, user: User & { tenant: Tenant }) => {
    localStorage.setItem('token', token);
    setState({ user, token, loading: false });
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, loading: false });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState(s => ({ ...s, loading: false }));
      return;
    }
    api.me()
      .then((data: any) => setAuth(token, data))
      .catch(() => clearAuth());
  }, [setAuth, clearAuth]);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setAuth(res.token, res.user);
  };

  const register = async (email: string, password: string, name: string, tenantName: string) => {
    const res = await api.register({ email, password, name, tenantName });
    setAuth(res.token, res.user);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout: clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
