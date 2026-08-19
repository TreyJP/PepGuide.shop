import Link from 'next/link';

import { Logo } from '@/src/components/brand/logo';
import { BRAND } from '@/src/constants/brand';

export type LegalDocumentLayoutProps = {
  title: string;
  version: string;
  children: React.ReactNode;
};

export function LegalDocumentLayout({
  title,
  version,
  children,
}: LegalDocumentLayoutProps) {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/chat" className="inline-flex w-fit rounded-[14px] bg-white px-3 py-2 shadow-sm">
            <Logo variant="full" size="sm" />
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-foreground-secondary">
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/sign-up" className="hover:text-foreground">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {BRAND.name}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            Effective date: {version}
          </p>

          <article className="legal-prose mt-8">{children}</article>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <p className="container-page text-center text-xs text-foreground-secondary">
          {BRAND.notice}
        </p>
      </footer>
    </div>
  );
}
