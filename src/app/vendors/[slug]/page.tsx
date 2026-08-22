import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MedicalDisclaimer, RelatedGuides } from '@/src/components/seo/related-content';
import { SeoEngagementBeacon } from '@/src/components/seo/seo-engagement-beacon';
import { SeoProse } from '@/src/components/seo/seo-prose';
import { JsonLd, SeoBreadcrumbs, SeoShell } from '@/src/components/seo/seo-shell';
import { SEO_GUIDES } from '@/src/data/seo/guides';
import { getSeoVendorBySlug, getSeoVendors } from '@/src/data/seo/vendors';
import { breadcrumbJsonLd } from '@/src/lib/seo/json-ld';
import { buildPageMetadata } from '@/src/lib/seo/metadata';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSeoVendors().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendor = getSeoVendorBySlug(slug);
  if (!vendor) {
    return buildPageMetadata({
      title: 'Vendor not found',
      description: 'This vendor listing is unavailable.',
      path: `/vendors/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${vendor.name}: Peptide Vendor Profile`,
    description: `${vendor.summary} Catalog count and disclosed discount information where applicable.`,
    path: `/vendors/${vendor.slug}`,
    keywords: [vendor.name, 'peptide vendor', 'peptide testing', 'COA'],
  });
}

export default async function VendorSeoPage({ params }: Props) {
  const { slug } = await params;
  const vendor = getSeoVendorBySlug(slug);
  if (!vendor) notFound();

  const relatedGuides = SEO_GUIDES.filter(
    (g) => g.category === 'Vendors' || g.category === 'Testing & quality',
  ).slice(0, 4);

  return (
    <SeoShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Vendors', path: '/vendors' },
          { name: vendor.name, path: `/vendors/${vendor.slug}` },
        ])}
      />
      <SeoEngagementBeacon contentType="vendor" slug={vendor.slug} />
      <SeoBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Vendors', href: '/vendors' },
          { label: vendor.name },
        ]}
      />

      <article>
        <header className="max-w-3xl">
          <h1 className="seo-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {vendor.name}
          </h1>
          <p className="mt-3 text-base text-foreground-secondary sm:text-lg">{vendor.summary}</p>
          {vendor.trustedPartner ? (
            <p className="mt-3 text-sm text-foreground-secondary">
              Marked as a preferred PepGuide partner based on platform configuration — not a clinical
              endorsement.
            </p>
          ) : null}
        </header>

        <SeoProse>
          <section aria-labelledby="facts-heading">
            <h2 id="facts-heading">Listing facts</h2>
            <ul>
              <li>
                Website:{' '}
                <a href={vendor.website} rel="nofollow sponsored noopener noreferrer" target="_blank">
                  Visit {vendor.name}
                </a>{' '}
                (affiliate / tracked link where configured)
              </li>
              <li>Disclosed discount label: {vendor.discountLabel}</li>
              <li>Coupon code shown on PepGuide: {vendor.couponCode}</li>
              <li>Products currently in PepGuide catalog snapshot: {vendor.catalogCount}</li>
            </ul>
          </section>

          <section aria-labelledby="methodology-heading">
            <h2 id="methodology-heading">PepGuide methodology</h2>
            <p>
              This page surfaces partner-configured fields only. PepGuide does not invent lab results,
              star ratings, shipping guarantees, or certifications for {vendor.name}.
            </p>
            <p>
              For literacy on documentation, read{' '}
              <Link href="/guides/how-to-read-a-peptide-coa">how to read a peptide COA</Link> and{' '}
              <Link href="/guides/peptide-purity-testing">peptide purity testing</Link>.
            </p>
          </section>

          {vendor.productNames.length > 0 ? (
            <section aria-labelledby="catalog-heading">
              <h2 id="catalog-heading">Sample catalog names</h2>
              <p>
                Names below reflect PepGuide’s affiliate catalog snapshot and may change. Confirm
                current offerings on the vendor site.
              </p>
              <ul>
                {vendor.productNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="reviews-heading">
            <h2 id="reviews-heading">Reviews</h2>
            <p>
              This SEO profile does not display fabricated ratings. If PepGuide’s in-app vendor
              review features are available on your account, use those surfaces for community
              feedback — not this page’s schema.
            </p>
          </section>
        </SeoProse>

        <p className="mt-8 text-sm">
          Compare more listings in the{' '}
          <Link href="/vendors" className="text-accent hover:underline">
            vendor directory
          </Link>{' '}
          or browse{' '}
          <Link href="/peptides" className="text-accent hover:underline">
            peptide education profiles
          </Link>
          .
        </p>

        <RelatedGuides guides={relatedGuides} />
        <MedicalDisclaimer />
      </article>
    </SeoShell>
  );
}
