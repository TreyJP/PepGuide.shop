import type { Metadata } from 'next';
import Link from 'next/link';

import { PeptideDirectorySearch } from '@/src/components/seo/peptide-directory-search';
import {
  MedicalDisclaimer,
  RelatedGuides,
} from '@/src/components/seo/related-content';
import { SeoBreadcrumbs, SeoShell, JsonLd } from '@/src/components/seo/seo-shell';
import { SeoEngagementBeacon } from '@/src/components/seo/seo-engagement-beacon';
import { SEO_GUIDES } from '@/src/data/seo/guides';
import { breadcrumbJsonLd } from '@/src/lib/seo/json-ld';
import { buildPageMetadata } from '@/src/lib/seo/metadata';
import {
  categoryLabel,
  getIndexablePeptides,
  getSeoDisplayName,
  peptidesByCategory,
} from '@/src/lib/seo/peptides';

export const metadata: Metadata = buildPageMetadata({
  title: 'Peptide Directory: Research Guides & Compound Profiles',
  description:
    'Browse PepGuide’s educational peptide directory — summaries, evidence grades, research areas, and links to detailed compound profiles.',
  path: '/peptides',
  keywords: ['peptides', 'peptide directory', 'peptide research', 'peptide guides'],
});

export default function PeptidesHubPage() {
  const groups = peptidesByCategory();
  const all = getIndexablePeptides();
  const searchOptions = all.map((p) => ({
    id: p.id,
    name: getSeoDisplayName(p),
    summary: p.summary,
    categoryLabel: categoryLabel(p.categories[0] ?? 'general'),
  }));

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Peptides', path: '/peptides' },
        ])}
      />
      <SeoEngagementBeacon contentType="hub" slug="peptides" />
      <SeoBreadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Peptides' }]}
      />

      <header className="max-w-3xl">
        <h1 className="seo-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Peptide research directory
        </h1>
        <p className="mt-3 text-base text-foreground-secondary sm:text-lg">
          Explore educational profiles for research peptides and related compounds. Each page
          summarizes proposed mechanisms, evidence character, safety notes, and regulatory framing —
          without medical advice or purchasing prescriptions.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/guides" className="text-accent underline-offset-2 hover:underline">
          Educational guides
        </Link>
        <span aria-hidden className="text-foreground-secondary">
          ·
        </span>
        <Link href="/vendors" className="text-accent underline-offset-2 hover:underline">
          Vendor directory
        </Link>
        <span aria-hidden className="text-foreground-secondary">
          ·
        </span>
        <Link href="/guides/what-are-peptides" className="text-accent underline-offset-2 hover:underline">
          What are peptides?
        </Link>
      </div>

      <div className="mt-8">
        <PeptideDirectorySearch peptides={searchOptions} />
      </div>

      <section aria-labelledby="peptide-categories-heading" className="space-y-10">
        <h2 id="peptide-categories-heading" className="sr-only">
          Peptides by category
        </h2>
        {groups.map((group) => (
          <section key={group.category} aria-labelledby={`cat-${group.category}`}>
            <h2
              id={`cat-${group.category}`}
              className="seo-heading text-xl font-semibold tracking-tight"
            >
              {group.label}
            </h2>
            <ul className="seo-card-grid mt-4 list-none p-0">
              {group.peptides.map((peptide) => {
                const name = getSeoDisplayName(peptide);
                return (
                  <li key={peptide.id} id={`peptide-${peptide.id}`}>
                    <Link href={`/peptides/${peptide.id}`} className="seo-card block h-full">
                      <p className="font-semibold text-foreground">{name}</p>
                      <p className="mt-1 line-clamp-3 text-sm text-foreground-secondary">
                        {peptide.summary}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </section>

      <RelatedGuides guides={SEO_GUIDES.slice(0, 4)} title="Start with these guides" />
      <MedicalDisclaimer />
    </SeoShell>
  );
}
