import type { Metadata } from 'next';
import Link from 'next/link';

import { MedicalDisclaimer } from '@/src/components/seo/related-content';
import { SeoEngagementBeacon } from '@/src/components/seo/seo-engagement-beacon';
import { SeoShell } from '@/src/components/seo/seo-shell';
import { BRAND } from '@/src/constants/brand';
import { SEO_GUIDES } from '@/src/data/seo/guides';
import { buildPageMetadata } from '@/src/lib/seo/metadata';
import {
  getIndexablePeptides,
  getSeoDisplayName,
} from '@/src/lib/seo/peptides';

export const metadata: Metadata = buildPageMetadata({
  title: 'Peptide Research Education',
  description: BRAND.description,
  path: '/',
  keywords: [
    'peptides',
    'peptide research',
    'peptide education',
    'peptide guides',
    'what are peptides',
  ],
});

export default function HomePage() {
  const featuredPeptides = getIndexablePeptides().slice(0, 6);
  const featuredGuides = SEO_GUIDES.slice(0, 3);

  return (
    <SeoShell>
      <SeoEngagementBeacon contentType="home" slug="home" />

      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 10% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 100%, color-mix(in srgb, #0A1B3A 12%, transparent), transparent 50%)',
          }}
        />
        <div className="relative max-w-2xl">
          <h1 className="seo-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {BRAND.name}
          </h1>
          <p className="mt-3 text-xl font-medium text-foreground sm:text-2xl">
            {BRAND.headline}
          </p>
          <p className="mt-4 text-base text-foreground-secondary sm:text-lg">
            Educational profiles, research guides, and vendor discovery — organized so you can
            separate marketing noise from evidence grades.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/peptides"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Browse peptides
            </Link>
            <Link
              href="/guides/what-are-peptides"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:border-accent/40"
            >
              What are peptides?
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-accent hover:underline"
            >
              Open PepGuide AI
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="explore-heading">
        <h2 id="explore-heading" className="seo-heading text-2xl font-semibold tracking-tight">
          Explore educational hubs
        </h2>
        <div className="seo-card-grid mt-5">
          <Link href="/peptides" className="seo-card block">
            <p className="font-semibold text-foreground">Peptide directory</p>
            <p className="mt-1 text-sm text-foreground-secondary">
              Compound profiles with evidence grades, safety notes, and FAQs.
            </p>
          </Link>
          <Link href="/guides" className="seo-card block">
            <p className="font-semibold text-foreground">Guides</p>
            <p className="mt-1 text-sm text-foreground-secondary">
              COAs, purity testing, research literacy, and beginner foundations.
            </p>
          </Link>
          <Link href="/vendors" className="seo-card block">
            <p className="font-semibold text-foreground">Vendors</p>
            <p className="mt-1 text-sm text-foreground-secondary">
              Factual partner listings — no fabricated ratings or lab scores.
            </p>
          </Link>
          <Link href="/calculator" className="seo-card block">
            <p className="font-semibold text-foreground">Calculator</p>
            <p className="mt-1 text-sm text-foreground-secondary">
              Research tools inside the PepGuide app experience.
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="featured-peptides-heading">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="featured-peptides-heading"
            className="seo-heading text-2xl font-semibold tracking-tight"
          >
            Featured peptide profiles
          </h2>
          <Link href="/peptides" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        <ul className="seo-card-grid mt-5 list-none p-0">
          {featuredPeptides.map((peptide) => (
            <li key={peptide.id}>
              <Link href={`/peptides/${peptide.id}`} className="seo-card block h-full">
                <p className="font-semibold text-foreground">{getSeoDisplayName(peptide)}</p>
                <p className="mt-1 line-clamp-3 text-sm text-foreground-secondary">
                  {peptide.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="featured-guides-heading">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="featured-guides-heading"
            className="seo-heading text-2xl font-semibold tracking-tight"
          >
            Start with these guides
          </h2>
          <Link href="/guides" className="text-sm text-accent hover:underline">
            All guides
          </Link>
        </div>
        <ul className="seo-card-grid mt-5 list-none p-0">
          {featuredGuides.map((guide) => (
            <li key={guide.slug}>
              <Link href={`/guides/${guide.slug}`} className="seo-card block h-full">
                <p className="font-semibold text-foreground">{guide.title}</p>
                <p className="mt-1 text-sm text-foreground-secondary">{guide.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MedicalDisclaimer />
    </SeoShell>
  );
}
