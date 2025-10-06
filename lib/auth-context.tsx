'use client';

// Authentication Context
// Manages user session across the application

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from './api-client';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'company' | 'investor';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, userType?: 'company' | 'investor') => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response: any = await auth.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string, userType: 'company' | 'investor' = 'company') {
    try {
      const response: any = await auth.login(email, password, userType);
      if (response?.user) {
        setUser(response.user);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  }

  async function register(email: string, name: string, password: string) {
    try {
      const response: any = await auth.register(email, name, password);
      if (response?.company) {
        setUser(response.company);
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
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

