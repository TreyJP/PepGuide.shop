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
    let settled = false;
    setInitializing(true);

    const unsubscribe = authService.subscribe((user) => {
      settled = true;
      setUser(user);
      setInitializing(false);
    });

    // Safety valve: never leave the app on the loading screen forever.
    const timeoutId = window.setTimeout(() => {
      if (!settled) setInitializing(false);
    }, 8000);

    void initFirebaseAnalytics();

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [setUser, setInitializing]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}
