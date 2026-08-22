import Link from 'next/link';

import type { SeoGuide } from '@/src/data/seo/guides';
import type { KnowledgeCompound } from '@/src/data/knowledge/types';
import { getSeoDisplayName } from '@/src/lib/seo/peptides';
import '@/src/components/seo/seo-content.css';

export function RelatedPeptides({
  peptides,
  title = 'Related peptides',
}: {
  peptides: KnowledgeCompound[];
  title?: string;
}) {
  if (peptides.length === 0) return null;
  return (
    <aside aria-labelledby="related-peptides-heading" className="mt-10">
      <h2 id="related-peptides-heading" className="seo-heading text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="seo-card-grid mt-4">
        {peptides.map((peptide) => {
          const name = getSeoDisplayName(peptide);
          return (
            <Link key={peptide.id} href={`/peptides/${peptide.id}`} className="seo-card block">
              <p className="font-semibold text-foreground">{name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-foreground-secondary">
                {peptide.summary}
              </p>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export function RelatedGuides({
  guides,
  title = 'Related guides',
}: {
  guides: SeoGuide[];
  title?: string;
}) {
  if (guides.length === 0) return null;
  return (
    <aside aria-labelledby="related-guides-heading" className="mt-10">
      <h2 id="related-guides-heading" className="seo-heading text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="seo-card-grid mt-4">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="seo-card block">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">
              {guide.category}
            </p>
            <p className="mt-1 font-semibold text-foreground">{guide.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-foreground-secondary">
              {guide.description}
            </p>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export function MedicalDisclaimer() {
  return (
    <p className="seo-disclaimer">
      Educational and research information only. PepGuide does not sell or prescribe peptides,
      diagnose conditions, or provide personalized medical advice. Evidence summaries may include
      early-stage, animal, or limited human research — none of that is a substitute for primary
      literature or clinician guidance.
    </p>
  );
}
