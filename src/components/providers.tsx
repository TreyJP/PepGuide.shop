'use client';

import { ThemeProvider } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { AuthModal } from '@/src/components/auth/sign-in-modal';
import { authService } from '@/src/services/auth';
import { initFirebaseAnalytics } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

function AuthQueryListener() {
  const searchParams = useSearchParams();
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const openSignUpModal = useUiStore((state) => state.openSignUpModal);

  useEffect(() => {
    if (searchParams.get('signup') === '1') {
      openSignUpModal();
      return;
    }
    if (searchParams.get('signin') === '1') {
      openSignInModal();
    }
  }, [searchParams, openSignInModal, openSignUpModal]);

  return null;
}

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
      <AuthModal />
      <Suspense fallback={null}>
        <AuthQueryListener />
      </Suspense>
    </ThemeProvider>
  );
}
