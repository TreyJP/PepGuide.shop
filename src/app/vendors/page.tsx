import type { Metadata } from 'next';
import Link from 'next/link';

import { MedicalDisclaimer } from '@/src/components/seo/related-content';
import { SeoEngagementBeacon } from '@/src/components/seo/seo-engagement-beacon';
import { JsonLd, SeoBreadcrumbs, SeoShell } from '@/src/components/seo/seo-shell';
import { getSeoVendors } from '@/src/data/seo/vendors';
import { breadcrumbJsonLd } from '@/src/lib/seo/json-ld';
import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Peptide Vendor Directory',
  description:
    'Discover PepGuide partner vendor listings with factual catalog details, disclosed discounts where applicable, and links to testing literacy guides. Not medical endorsements.',
  path: '/vendors',
  keywords: ['peptide vendors', 'peptide vendor research', 'peptide COA', 'vendor directory'],
});

export default function VendorsHubPage() {
  const vendors = getSeoVendors();

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Vendors', path: '/vendors' },
        ])}
      />
      <SeoEngagementBeacon contentType="hub" slug="vendors" />
      <SeoBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Vendors' }]} />

      <header className="max-w-3xl">
        <h1 className="seo-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Peptide vendor directory
        </h1>
        <p className="mt-3 text-base text-foreground-secondary sm:text-lg">
          Factual partner listings for research discovery. PepGuide does not invent ratings,
          purity scores, or certifications. Review{' '}
          <Link href="/guides/vendor-research-and-testing" className="text-accent hover:underline">
            how we approach vendor research & testing
          </Link>{' '}
          and{' '}
          <Link href="/guides/how-to-read-a-peptide-coa" className="text-accent hover:underline">
            how to read a COA
          </Link>
          .
        </p>
      </header>

      <ul className="seo-card-grid mt-10 list-none p-0">
        {vendors.map((vendor) => (
          <li key={vendor.slug}>
            <Link href={`/vendors/${vendor.slug}`} className="seo-card block h-full">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{vendor.name}</p>
                {vendor.trustedPartner ? (
                  <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-xs text-foreground-secondary">
                    Preferred partner
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-foreground-secondary">{vendor.summary}</p>
              <p className="mt-3 text-xs text-foreground-secondary">
                {vendor.catalogCount} catalog products listed · {vendor.discountLabel}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <MedicalDisclaimer />
    </SeoShell>
  );
}
