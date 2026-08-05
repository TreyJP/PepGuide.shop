'use client';

import { useEffect } from 'react';

import { AppSidebar } from '@/src/components/layout/app-sidebar';
import { MobileTopBar } from '@/src/components/layout/mobile-top-bar';
import { useAuthStore } from '@/src/stores/auth-store';
import { useCycleStore } from '@/src/stores/cycle-store';
import { usePartnersStore } from '@/src/stores/partners-store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loaded = usePartnersStore((state) => state.loaded);
  const loadPartners = usePartnersStore((state) => state.loadPartners);
  const cycleLoaded = useCycleStore((state) => state.loaded);
  const loadCycle = useCycleStore((state) => state.loadItems);

  useEffect(() => {
    if (user && !loaded) {
      void loadPartners();
    }
    if (user && !cycleLoaded) {
      void loadCycle();
    }
  }, [user, loaded, loadPartners, cycleLoaded, loadCycle]);

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileTopBar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
