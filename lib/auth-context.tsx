'use client';

// auth context - global auth state accessible to all client components
// wraps the app in providers.tsx so session persists across navigation
// refreshAuth() is key for updating UI after invitation acceptance

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
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // check session on mount - auto-login if valid cookie exists
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

  async function refreshAuth() {
    await checkAuth();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshAuth }}>
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
