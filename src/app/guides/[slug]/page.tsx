import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  MedicalDisclaimer,
  RelatedGuides,
  RelatedPeptides,
} from '@/src/components/seo/related-content';
import { SeoEngagementBeacon } from '@/src/components/seo/seo-engagement-beacon';
import { SeoProse } from '@/src/components/seo/seo-prose';
import { JsonLd, SeoBreadcrumbs, SeoShell } from '@/src/components/seo/seo-shell';
import {
  getGuideBySlug,
  relatedGuidesForGuide,
  SEO_GUIDES,
} from '@/src/data/seo/guides';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from '@/src/lib/seo/json-ld';
import { buildPageMetadata } from '@/src/lib/seo/metadata';
import {
  getIndexablePeptides,
} from '@/src/lib/seo/peptides';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SEO_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return buildPageMetadata({
      title: 'Guide not found',
      description: 'This guide is unavailable.',
      path: `/guides/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: guide.seoTitle,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: 'article',
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
    keywords: guide.tags,
  });
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const relatedPeptideRows = getIndexablePeptides().filter((p) =>
    guide.relatedPeptideIds.includes(p.id),
  );
  const relatedGuideRows = relatedGuidesForGuide(guide.slug);

  const schema = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides' },
      { name: guide.title, path: `/guides/${guide.slug}` },
    ]),
    articleJsonLd({
      title: guide.seoTitle,
      description: guide.description,
      path: `/guides/${guide.slug}`,
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
    }),
    faqJsonLd(guide.faqs),
  ].filter(Boolean);

  return (
    <SeoShell>
      <JsonLd data={schema as object[]} />
      <SeoEngagementBeacon contentType="guide" slug={guide.slug} />
      <SeoBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: guide.title },
        ]}
      />

      <article>
        <header className="max-w-3xl">
          <p className="text-sm font-medium text-foreground-secondary">{guide.category}</p>
          <h1 className="mt-1 seo-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-3 text-base text-foreground-secondary sm:text-lg">
            {guide.introduction}
          </p>
          <p className="mt-4 text-sm text-foreground-secondary">
            Published {guide.publishedAt} · Updated {guide.updatedAt} · Reviewed by PepGuide
            editorial (educational content)
          </p>
        </header>

        <nav aria-label="Table of contents" className="seo-toc mt-8 max-w-xl">
          <p className="mb-2 text-sm font-semibold text-foreground">On this page</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {guide.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.heading}</a>
              </li>
            ))}
            {guide.faqs.length > 0 ? (
              <li>
                <a href="#faq">FAQ</a>
              </li>
            ) : null}
            <li>
              <a href="#references">References</a>
            </li>
          </ol>
        </nav>

        <SeoProse>
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`}>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </section>
          ))}

          {guide.faqs.length > 0 ? (
            <section id="faq" aria-labelledby="faq-heading">
              <h2 id="faq-heading">Frequently asked questions</h2>
              {guide.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </section>
          ) : null}

          <section id="references" aria-labelledby="references-heading">
            <h2 id="references-heading">References</h2>
            <ul>
              {guide.references.map((ref) => (
                <li key={ref.label}>
                  <strong>{ref.label}.</strong> {ref.note}
                </li>
              ))}
            </ul>
          </section>
        </SeoProse>

        <p className="mt-8 text-sm">
          Continue exploring the{' '}
          <Link href="/peptides" className="text-accent hover:underline">
            peptide directory
          </Link>{' '}
          or{' '}
          <Link href="/vendors" className="text-accent hover:underline">
            vendor research pages
          </Link>
          .
        </p>

        <RelatedPeptides
          peptides={relatedPeptideRows}
          title="Related peptide profiles"
        />
        <RelatedGuides guides={relatedGuideRows} />
        <MedicalDisclaimer />
      </article>
    </SeoShell>
  );
}
