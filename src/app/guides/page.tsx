import type { Metadata } from 'next';
import Link from 'next/link';

import {
  MedicalDisclaimer,
} from '@/src/components/seo/related-content';
import { SeoEngagementBeacon } from '@/src/components/seo/seo-engagement-beacon';
import { JsonLd, SeoBreadcrumbs, SeoShell } from '@/src/components/seo/seo-shell';
import { SEO_GUIDES } from '@/src/data/seo/guides';
import { breadcrumbJsonLd } from '@/src/lib/seo/json-ld';
import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Peptide Education Guides',
  description:
    'In-depth PepGuide articles on peptide basics, research evidence, COAs, purity testing, storage concepts, and vendor research literacy.',
  path: '/guides',
  keywords: ['peptide education', 'peptide guides', 'what are peptides', 'peptide COA'],
});

export default function GuidesHubPage() {
  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
        ])}
      />
      <SeoEngagementBeacon contentType="hub" slug="guides" />
      <SeoBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides' }]} />

      <header className="max-w-3xl">
        <h1 className="seo-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Peptide education guides
        </h1>
        <p className="mt-3 text-base text-foreground-secondary sm:text-lg">
          Fewer, deeper resources focused on real search questions — not thin doorway articles.
          Start here, then explore compound profiles in the{' '}
          <Link href="/peptides" className="text-accent hover:underline">
            peptide directory
          </Link>
          .
        </p>
      </header>

      <ul className="seo-card-grid mt-10 list-none p-0">
        {SEO_GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className="seo-card block h-full">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">
                {guide.category}
              </p>
              <p className="mt-1 font-semibold text-foreground">{guide.title}</p>
              <p className="mt-2 text-sm text-foreground-secondary">{guide.description}</p>
              <p className="mt-3 text-xs text-foreground-secondary">
                Updated {guide.updatedAt}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <MedicalDisclaimer />
    </SeoShell>
  );
}
