'use client';

import { ForumPanel } from '@/src/components/pro/forum-panel';
import '@/src/components/pro/forum-designs.css';
import { ProLockedPreview } from '@/src/components/pro/pro-locked-preview';
import { useProAccess } from '@/src/hooks/use-pro-access';

function ForumLockedTeaser() {
  return (
    <div className="forum-agora-shell">
      <ul className="forum-agora-list">
        {[
          'Welcome to Questions & Discussion',
          'Research notes thread',
          'Study design discussion',
        ].map((title) => (
          <li key={title}>
            <div className="forum-agora-tile">
              <p className="forum-agora-title">{title}</p>
              <p className="text-sm text-foreground-secondary">
                Member discussion preview for PepGuide Pro.
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProForumPage() {
  const { loading, isPro } = useProAccess();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-3.5 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-foreground sm:text-2xl">
          Questions & Discussion
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Ask questions, share notes, and reply with other PepGuide Pro members.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 pb-6 sm:p-6">
        <div className="mx-auto w-full max-w-4xl">
          {loading ? (
            <p className="text-sm text-foreground-secondary">Loading…</p>
          ) : isPro ? (
            <ForumPanel />
          ) : (
            <ProLockedPreview feature="Questions & Discussion">
              <ForumLockedTeaser />
            </ProLockedPreview>
          )}
        </div>
      </div>
    </div>
  );
}
