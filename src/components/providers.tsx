'use client';

import { ThemeProvider } from 'next-themes';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { AuthModal } from '@/src/components/auth/sign-in-modal';
import { captureCampaignReferralFromUrl } from '@/src/lib/campaigns/client-attribution';
import { authService } from '@/src/services/auth';
import {
  getFirebaseAuth,
  initFirebaseAnalytics,
} from '@/src/services/firebase/config';
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

function CampaignRefCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    void captureCampaignReferralFromUrl(searchParams);
  }, [searchParams, pathname]);

  useEffect(() => {
    if (!user) return;
    const key = `pepguide.campaign.session.${new Date().toISOString().slice(0, 10)}`;
    if (window.sessionStorage.getItem(key) === '1') return;
    void (async () => {
      try {
        const token = await getFirebaseAuth()?.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch('/api/campaigns/engagement', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ kind: 'session' }),
        });
        if (res.ok) window.sessionStorage.setItem(key, '1');
      } catch {
        // non-blocking
      }
    })();
  }, [user]);

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
        <CampaignRefCapture />
      </Suspense>
    </ThemeProvider>
  );
}
