'use client';

import { AppShell } from '@/src/components/layout/app-shell';
import { SignInModal } from '@/src/components/auth/sign-in-modal';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const initializing = useAuthStore((state) => state.initializing);
  const signInModalOpen = useUiStore((state) => state.signInModalOpen);
  const signInModalMessage = useUiStore((state) => state.signInModalMessage);
  const closeSignInModal = useUiStore((state) => state.closeSignInModal);

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
    </AppShell>
  );
}
