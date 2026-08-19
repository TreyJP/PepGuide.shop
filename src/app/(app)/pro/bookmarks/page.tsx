'use client';

import { BookmarksPanel } from '@/src/components/pro/bookmarks-panel';

export default function ProBookmarksPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-3.5 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-foreground sm:text-2xl">
          Bookmarks
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Peptides and education videos you saved for later.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 pb-6 sm:p-6">
        <div className="mx-auto w-full max-w-3xl">
          <BookmarksPanel />
        </div>
      </div>
    </div>
  );
}
