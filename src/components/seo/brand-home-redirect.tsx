'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Logo } from '@/src/components/brand/logo';
import { BRAND } from '@/src/constants/brand';

/**
 * Keeps chat as the product home while leaving crawlable PepGuide brand HTML
 * on `/` for branded search (Google “PepGuide”).
 */
export function BrandHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <Link
        href="/chat"
        className="inline-flex rounded-[14px] bg-white px-4 py-3 shadow-sm"
        aria-label="Open PepGuide"
      >
        <Logo variant="full" size="md" priority />
      </Link>

      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        PepGuide
      </h1>
      <p className="mt-3 max-w-md text-base text-foreground-secondary">
        {BRAND.tagline} Official PepGuide site for peptide research education,
        compound guides, and vendor discovery.
      </p>
      <p className="mt-6 text-sm text-foreground-secondary">Opening PepGuide…</p>
      <Link
        href="/chat"
        className="mt-4 text-sm font-semibold text-accent underline-offset-2 hover:underline"
      >
        Continue to chat
      </Link>

      <nav
        aria-label="PepGuide sections"
        className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-foreground-secondary"
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
        <Link href="/welcome" className="hover:text-foreground">
          About PepGuide
        </Link>
      </nav>

      <p className="mt-8 max-w-sm text-xs text-foreground-secondary">{BRAND.notice}</p>
    </div>
  );
}
