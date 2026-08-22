import Link from 'next/link';

import { SeoShell } from '@/src/components/seo/seo-shell';

export default function NotFound() {
  return (
    <SeoShell>
      <div className="mx-auto max-w-xl py-10 text-center">
        <p className="text-sm font-medium text-foreground-secondary">404</p>
        <h1 className="mt-2 seo-heading text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-foreground-secondary">
          That URL may have moved, or the content isn’t published yet. Try one of these hubs:
        </p>
        <nav aria-label="Helpful links" className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          <Link
            href="/peptides"
            className="rounded-xl bg-accent px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            Peptide directory
          </Link>
          <Link
            href="/guides"
            className="rounded-xl border border-border px-4 py-2 font-semibold hover:border-accent/40"
          >
            Guides
          </Link>
          <Link
            href="/vendors"
            className="rounded-xl border border-border px-4 py-2 font-semibold hover:border-accent/40"
          >
            Vendors
          </Link>
          <Link href="/" className="rounded-xl px-4 py-2 font-semibold text-accent hover:underline">
            Home
          </Link>
        </nav>
      </div>
    </SeoShell>
  );
}
