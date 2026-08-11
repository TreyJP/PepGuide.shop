'use client';

import { useEffect } from 'react';

import { AppSidebar } from '@/src/components/layout/app-sidebar';
import { MobileTopBar } from '@/src/components/layout/mobile-top-bar';
import { PeptideOfWeekBanner } from '@/src/components/layout/peptide-of-week-banner';
import { ProEducationMarquee } from '@/src/components/layout/pro-education-marquee';
import { PEPTIDE_OF_WEEK_BANNER_ENABLED } from '@/src/data/pro/peptide-of-the-week';
import { useAuthStore } from '@/src/stores/auth-store';
import { useBookmarksStore } from '@/src/stores/bookmarks-store';
import { useCycleStore } from '@/src/stores/cycle-store';
import { usePartnersStore } from '@/src/stores/partners-store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loaded = usePartnersStore((state) => state.loaded);
  const loadPartners = usePartnersStore((state) => state.loadPartners);
  const cycleLoaded = useCycleStore((state) => state.loaded);
  const loadCycle = useCycleStore((state) => state.loadItems);
  const loadBookmarks = useBookmarksStore((state) => state.loadBookmarks);
  const clearBookmarks = useBookmarksStore((state) => state.clear);
  const bookmarksUserId = useBookmarksStore((state) => state.loadedForUserId);

  useEffect(() => {
    if (user && !loaded) {
      void loadPartners();
    }
    if (user && !cycleLoaded) {
      void loadCycle();
    }
    if (user && bookmarksUserId !== user.id) {
      void loadBookmarks(user.id);
    }
    if (!user && bookmarksUserId) {
      clearBookmarks();
    }
  }, [
    user,
    loaded,
    loadPartners,
    cycleLoaded,
    loadCycle,
    bookmarksUserId,
    loadBookmarks,
    clearBookmarks,
  ]);

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileTopBar />
        <ProEducationMarquee />
        {PEPTIDE_OF_WEEK_BANNER_ENABLED ? <PeptideOfWeekBanner /> : null}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
