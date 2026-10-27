import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { ApiService } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string, family_name?: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('utsavsetu_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('utsavsetu_token');
      if (storedToken) {
        try {
          const u = await ApiService.getMe();
          setUser(u);
        } catch {
          localStorage.removeItem('utsavsetu_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const resp = await ApiService.login(email, pass);
      localStorage.setItem('utsavsetu_token', resp.access_token);
      setToken(resp.access_token);
      setUser(resp.user);
      showToast(`Welcome back, ${resp.user.name}!`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Login failed', 'error');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string, family_name?: string) => {
    setLoading(true);
    try {
      const resp = await ApiService.register(name, email, pass, phone, family_name);
      localStorage.setItem('utsavsetu_token', resp.access_token);
      setToken(resp.access_token);
      setUser(resp.user);
      showToast('Registration successful! Welcome to UtsavSetu.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Registration failed', 'error');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    await login('demo@utsavsetu.com', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('utsavsetu_token');
    localStorage.removeItem('utsavsetu_active_event_id');
    setToken(null);
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

