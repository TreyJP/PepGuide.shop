'use client';

import { useEffect } from 'react';

import { InAppBrowserGate } from '@/src/components/auth/in-app-browser-gate';
import { SignInModal } from '@/src/components/auth/sign-in-modal';
import { ProSubscribeModal } from '@/src/components/billing/pro-subscribe-modal';
import { AppShell } from '@/src/components/layout/app-shell';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const initializing = useAuthStore((state) => state.initializing);
  const user = useAuthStore((state) => state.user);
  const signInModalOpen = useUiStore((state) => state.signInModalOpen);
  const signInModalMessage = useUiStore((state) => state.signInModalMessage);
  const closeSignInModal = useUiStore((state) => state.closeSignInModal);

  // Never keep the sign-in prompt open after auth succeeds (Google popup/redirect).
  useEffect(() => {
    if (user && signInModalOpen) closeSignInModal();
  }, [user, signInModalOpen, closeSignInModal]);

  if (initializing) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-foreground-secondary">Loading PepGuide…</p>
      </div>
    );
  }

  return (
    <AppShell>
      {children}
      <SignInModal
        open={signInModalOpen}
        onClose={closeSignInModal}
        message={signInModalMessage}
      />
      <ProSubscribeModal />
      <InAppBrowserGate />
    </AppShell>
  );
}
