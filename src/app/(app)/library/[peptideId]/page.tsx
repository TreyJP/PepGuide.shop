'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';

import { LibraryCompetitorPrices } from '@/src/components/library/library-competitor-prices';
import '@/src/components/library/library-catalog.css';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { peptideRepository } from '@/src/services/firestore/peptides';
import type { Peptide } from '@/src/types';

export default function PeptideProfilePage({
  params,
}: {
  params: Promise<{ peptideId: string }>;
}) {
  const { peptideId } = use(params);
  const [peptide, setPeptide] = useState<Peptide | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void peptideRepository.getById(peptideId).then((result) => {
      setPeptide(result);
      setLoaded(true);
    });
  }, [peptideId]);

  if (!loaded) {
    return <div className="p-6 text-foreground-secondary">Loading…</div>;
  }

  if (!peptide) {
    return (
      <div className="p-6">
        <EmptyState
          title="Compound not found"
          description="This listing may have been removed or the link is incorrect."
          action={
            <Link href="/library">
              <Button variant="secondary">Back to all peptides</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="lib-detail h-full overflow-y-auto">
      <header className="lib-detail__header">
        <Link href="/library" className="lib-detail__back">
          ← Back to all peptides
        </Link>
        <h1>{peptide.name}</h1>
        {peptide.aliases.length > 0 ? (
          <div className="lib-detail__aliases">
            {peptide.aliases.map((alias) => (
              <span key={alias}>{alias}</span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="lib-detail__body">
        <LibraryCompetitorPrices
          peptideId={peptide.id}
          peptideName={peptide.name}
        />

        <details className="lib-detail__research">
          <summary>Research notes</summary>
          <div className="lib-detail__research-body">
            <div className="lib-detail__research-block">
              <h3>Overview</h3>
              <p>{peptide.researchOverview}</p>
            </div>
            <div className="lib-detail__research-block">
              <h3>Proposed mechanism</h3>
              <p>{peptide.proposedMechanism}</p>
            </div>
            <div className="lib-detail__research-block">
              <h3>Human evidence</h3>
              <p>{peptide.humanEvidenceSummary}</p>
            </div>
            <div className="lib-detail__research-block">
              <h3>Risks</h3>
              <ul>
                {peptide.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
            {peptide.references.length > 0 ? (
              <div className="lib-detail__research-block">
                <h3>References</h3>
                <ul>
                  {peptide.references.map((reference) => (
                    <li key={reference.id}>
                      {reference.title}
                      {reference.year ? ` (${reference.year})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </div>
  );
}
