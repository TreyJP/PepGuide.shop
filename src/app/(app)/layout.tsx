'use client';

import { usePathname } from 'next/navigation';

import { InAppBrowserGate } from '@/src/components/auth/in-app-browser-gate';
import { ProSubscribeModal } from '@/src/components/billing/pro-subscribe-modal';
import { AppShell } from '@/src/components/layout/app-shell';
import { FeatureUpdateModal } from '@/src/components/onboarding/feature-update-modal';
import { useAuthStore } from '@/src/stores/auth-store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initializing = useAuthStore((state) => state.initializing);

  const isChatDeepLink =
    typeof pathname === 'string' && /^\/chat\/[^/]+/.test(pathname);

  if (initializing && !isChatDeepLink) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-foreground-secondary">Loading PepGuide…</p>
      </div>
    );
  }

  return (
    <AppShell>
      {children}
      <ProSubscribeModal />
      <FeatureUpdateModal />
      <InAppBrowserGate />
    </AppShell>
  );
}
