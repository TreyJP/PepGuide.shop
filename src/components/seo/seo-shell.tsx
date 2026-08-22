import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/src/components/brand/logo';
import { BRAND } from '@/src/constants/brand';
import '@/src/components/seo/seo-content.css';

export function JsonLd({ data }: { data: object | object[] | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function SeoShell({
  children,
  bare = false,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  if (bare) return <>{children}</>;

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            href="/peptides"
            className="inline-flex w-fit rounded-[14px] bg-white px-3 py-2 shadow-sm"
          >
            <Logo variant="full" size="sm" />
          </Link>
          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground-secondary"
          >
            <Link href="/peptides" className="hover:text-foreground">
              Peptides
            </Link>
            <Link href="/guides" className="hover:text-foreground">
              Guides
            </Link>
            <Link href="/vendors" className="hover:text-foreground">
              Vendors
            </Link>
            <Link href="/calculator" className="hover:text-foreground">
              Calculator
            </Link>
            <Link href="/library" className="hover:text-foreground">
              Library
            </Link>
            <Link href="/welcome" className="hover:text-foreground">
              About
            </Link>
            <Link href="/chat" className="font-semibold text-accent hover:opacity-90">
              Open PepGuide
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-foreground-secondary sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="max-w-md space-y-2">
            <p className="font-semibold text-foreground">{BRAND.name}</p>
            <p>{BRAND.notice}</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/guides/what-are-peptides" className="hover:text-foreground">
              What are peptides?
            </Link>
            <a href="mailto:support@pepguide.shop" className="hover:text-foreground">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function SeoBreadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-foreground-secondary">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
