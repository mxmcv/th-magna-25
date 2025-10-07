'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserType } from './types';
import { auth } from './api-client';

interface User {
  id: string;
  email: string;
  name?: string;
  userType: UserType;
  walletAddress?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, userType?: UserType) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response: any = await auth.me();
      // The API returns { user: {...} }
      setUser(response.user || response);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string, userType: UserType = 'company') {
    // Pass as object to match API client signature
    const response: any = await auth.login({ email, password, userType });
    // The login response includes the user data
    setUser(response.user || response);
  }

  async function logout() {
    await auth.logout();
    setUser(null);
  }

  async function register(email: string, name: string, password: string) {
    // Register the company
    await auth.register({ email, name, password });
    // After registration, login to get session
    await login(email, password, 'company');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
