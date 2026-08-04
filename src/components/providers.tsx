'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';

import { authService } from '@/src/services/auth';
import { initFirebaseAnalytics } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    setInitializing(true);

    const unsubscribe = authService.subscribe((user) => {
      setUser(user);
      setInitializing(false);
    });

    void initFirebaseAnalytics();

    return unsubscribe;
  }, [setUser, setInitializing]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}
