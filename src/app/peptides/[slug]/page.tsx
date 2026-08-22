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
import { relatedGuidesForPeptide } from '@/src/data/seo/guides';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from '@/src/lib/seo/json-ld';
import { buildPageMetadata } from '@/src/lib/seo/metadata';
import {
  buildPeptideFaqs,
  evidenceGradeLabel,
  getIndexablePeptides,
  getPeptideBySlug,
  getSeoDisplayName,
  regulatoryLabel,
  relatedPeptides,
} from '@/src/lib/seo/peptides';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getIndexablePeptides().map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const compound = getPeptideBySlug(slug);
  if (!compound) {
    return buildPageMetadata({
      title: 'Peptide not found',
      description: 'This peptide profile is unavailable.',
      path: `/peptides/${slug}`,
      noIndex: true,
    });
  }

  const name = getSeoDisplayName(compound);
  return buildPageMetadata({
    title: `${name} Guide: Research, Evidence & Safety`,
    description: `${compound.summary.slice(0, 155)}${compound.summary.length > 155 ? '…' : ''}`,
    path: `/peptides/${compound.id}`,
    keywords: [name, ...compound.aliases.slice(0, 4), 'peptide research', 'peptide guide'],
  });
}

export default async function PeptideSeoPage({ params }: Props) {
  const { slug } = await params;
  const compound = getPeptideBySlug(slug);
  if (!compound) notFound();

  const name = getSeoDisplayName(compound);
  const faqs = buildPeptideFaqs(compound);
  const related = relatedPeptides(compound);
  const guides = relatedGuidesForPeptide(compound.id);
  const toc = [
    { id: 'what-is', label: `What is ${name}?` },
    { id: 'mechanism', label: 'Proposed mechanism' },
    { id: 'research', label: 'Current research notes' },
    { id: 'effects', label: 'Research areas being studied' },
    { id: 'safety', label: 'Safety & side-effect notes' },
    { id: 'regulatory', label: 'Regulatory status' },
    { id: 'faq', label: 'FAQ' },
    { id: 'references', label: 'References' },
  ];

  const schema = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Peptides', path: '/peptides' },
      { name: name, path: `/peptides/${compound.id}` },
    ]),
    articleJsonLd({
      title: `${name} Guide: Research, Evidence & Safety`,
      description: compound.summary,
      path: `/peptides/${compound.id}`,
      datePublished: compound.lastReviewedAt,
      dateModified: compound.lastReviewedAt,
    }),
    faqJsonLd(faqs),
  ].filter(Boolean);

  return (
    <SeoShell>
      <JsonLd data={schema as object[]} />
      <SeoEngagementBeacon contentType="peptide" slug={compound.id} />
      <SeoBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Peptides', href: '/peptides' },
          { label: name },
        ]}
      />

      <article>
        <header className="max-w-3xl">
          <p className="text-sm font-medium text-foreground-secondary">
            {compound.classification}
          </p>
          <h1 className="mt-1 seo-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {name}
          </h1>
          <p className="mt-3 text-base text-foreground-secondary sm:text-lg">
            {compound.summary}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground-secondary">
            <div>
              <dt className="inline font-medium text-foreground">Evidence: </dt>
              <dd className="inline">{evidenceGradeLabel(compound.humanEvidenceGrade)}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Status: </dt>
              <dd className="inline">{regulatoryLabel(compound.regulatoryStatus)}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Reviewed: </dt>
              <dd className="inline">{compound.lastReviewedAt}</dd>
            </div>
          </dl>
          {compound.aliases.length > 0 ? (
            <p className="mt-3 text-sm text-foreground-secondary">
              Also known as: {compound.aliases.join(', ')}
            </p>
          ) : null}
        </header>

        <nav aria-label="Table of contents" className="seo-toc mt-8 max-w-xl">
          <p className="mb-2 text-sm font-semibold text-foreground">On this page</p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <SeoProse>
          <section id="what-is" aria-labelledby="what-is-heading">
            <h2 id="what-is-heading">What is {name}?</h2>
            <p>{compound.summary}</p>
            <p>
              This profile is educational. It organizes publicly discussed research context for{' '}
              {name} and related naming aliases — it is not a treatment guide.
            </p>
          </section>

          <section id="mechanism" aria-labelledby="mechanism-heading">
            <h2 id="mechanism-heading">Proposed mechanism</h2>
            <p>{compound.proposedMechanism}</p>
            <p>
              Mechanism language on PepGuide describes how researchers discuss pathways. Proposed
              mechanisms can change as evidence evolves.
            </p>
          </section>

          <section id="research" aria-labelledby="research-heading">
            <h2 id="research-heading">Current research notes</h2>
            <p>
              <strong>Human evidence grade:</strong> {evidenceGradeLabel(compound.humanEvidenceGrade)}
            </p>
            <p>
              <strong>Preclinical evidence grade:</strong>{' '}
              {evidenceGradeLabel(compound.preclinicalEvidenceGrade)}
            </p>
            <p>{compound.researchNotes}</p>
            {compound.uncertainties.length > 0 ? (
              <>
                <h3>Key uncertainties</h3>
                <ul>
                  {compound.uncertainties.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section id="effects" aria-labelledby="effects-heading">
            <h2 id="effects-heading">Research areas being studied</h2>
            {compound.researchAreas.length > 0 ? (
              <ul>
                {compound.researchAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            ) : (
              <p>Research areas for {name} are not fully enumerated in this summary.</p>
            )}
            <p>
              Being studied for a topic is not the same as proven benefit in that topic. Prefer
              primary literature for study design, endpoints, and limitations.
            </p>
          </section>

          <section id="safety" aria-labelledby="safety-heading">
            <h2 id="safety-heading">Safety & side-effect notes</h2>
            {compound.knownAdverseEffects.length > 0 ? (
              <>
                <h3>Reported or discussed adverse effects</h3>
                <ul>
                  {compound.knownAdverseEffects.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>
                Specific adverse-effect lists are limited in this summary. Absence of a list does not
                mean a compound is risk-free.
              </p>
            )}
            {compound.risks.length > 0 ? (
              <>
                <h3>Additional risks & considerations</h3>
                <ul>
                  {compound.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section id="regulatory" aria-labelledby="regulatory-heading">
            <h2 id="regulatory-heading">Regulatory status</h2>
            <p>{regulatoryLabel(compound.regulatoryStatus)}</p>
            {compound.regulatoryDetail ? <p>{compound.regulatoryDetail}</p> : null}
            <p>
              Regulatory framing here is educational and can lag policy changes. Check official
              sources for current status.
            </p>
          </section>

          {faqs.length > 0 ? (
            <section id="faq" aria-labelledby="faq-heading">
              <h2 id="faq-heading">Frequently asked questions</h2>
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </section>
          ) : null}

          <section id="references" aria-labelledby="references-heading">
            <h2 id="references-heading">References & sources</h2>
            {compound.references.length > 0 ? (
              <ul>
                {compound.references.map((ref) => (
                  <li key={ref.id}>
                    {ref.authors} ({ref.year}). {ref.title}
                    {ref.journal ? ` — ${ref.journal}` : ''}. Evidence type: {ref.evidenceType}.
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Citation titles are not attached to this entry yet. Treat the summary as a starting
                point and verify claims in primary literature.
              </p>
            )}
          </section>
        </SeoProse>

        <p className="mt-8 text-sm text-foreground-secondary">
          Prefer interactive tools? Open the{' '}
          <Link href={`/library/${compound.id}`} className="text-accent hover:underline">
            PepGuide library entry for {name}
          </Link>{' '}
          or ask{' '}
          <Link href="/chat" className="text-accent hover:underline">
            PepGuide AI
          </Link>
          .
        </p>

        <RelatedPeptides peptides={related} />
        <RelatedGuides guides={guides} />
        <MedicalDisclaimer />
      </article>
    </SeoShell>
  );
}
