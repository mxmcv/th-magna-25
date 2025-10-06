'use client';

// Client-side providers wrapper
import { AuthProvider } from './auth-context';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

