'use client';

import { AskProfessionalPanel } from '@/src/components/pro/ask-professional-panel';

export default function AskProfessionalPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-3.5 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-foreground sm:text-2xl">
          Ask a Professional
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          One-on-one questions with the PepGuide admin team.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 pb-6 sm:p-6">
        <div className="mx-auto w-full max-w-3xl">
          <AskProfessionalPanel />
        </div>
      </div>
    </div>
  );
}
