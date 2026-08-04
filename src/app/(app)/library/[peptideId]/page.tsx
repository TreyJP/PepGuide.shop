'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';

import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { EmptyState } from '@/src/components/ui/empty-state';
import {
  evidenceLabel,
  evidenceTone,
  regulatoryLabel,
} from '@/src/lib/evidence';
import { peptideRepository } from '@/src/services/firestore/peptides';
import { useComparisonStore } from '@/src/stores/comparison-store';
import type { Peptide } from '@/src/types';

export default function PeptideProfilePage({
  params,
}: {
  params: Promise<{ peptideId: string }>;
}) {
  const { peptideId } = use(params);
  const [peptide, setPeptide] = useState<Peptide | null>(null);
  const [loaded, setLoaded] = useState(false);
  const addPeptide = useComparisonStore((state) => state.addPeptide);

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
          title="Peptide not found"
          description="This profile may have been removed or the link is incorrect."
          action={
            <Link href="/library">
              <Button variant="secondary">Back to library</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-border px-6 py-5">
        <Link
          href="/library"
          className="text-sm text-accent hover:underline"
        >
          ← Back to library
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
          {peptide.name}
        </h1>
        <p className="mt-2 max-w-3xl text-foreground-secondary">{peptide.shortDescription}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={evidenceTone(peptide.humanEvidenceGrade)}>
            {evidenceLabel(peptide.humanEvidenceGrade)}
          </Badge>
          <Badge variant="muted">
            {regulatoryLabel(peptide.regulatoryStatus, peptide.regulatoryDetail)}
          </Badge>
          {peptide.aliases.map((alias) => (
            <Badge key={alias} variant="default">
              {alias}
            </Badge>
          ))}
        </div>
        <Button
          className="mt-4"
          variant="secondary"
          size="sm"
          onClick={() => addPeptide(peptide.id)}
        >
          Add to compare
        </Button>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Research overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-foreground-secondary">
            <p>{peptide.researchOverview}</p>
            <div>
              <p className="mb-1 font-medium text-foreground">Proposed mechanism</p>
              <p>{peptide.proposedMechanism}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence summaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground-secondary">
            <div>
              <p className="mb-1 font-medium text-foreground">Human evidence</p>
              <p>{peptide.humanEvidenceSummary}</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-foreground">Animal evidence</p>
              <p>{peptide.animalEvidenceSummary}</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-foreground">In vitro evidence</p>
              <p>{peptide.invitroEvidenceSummary}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risks & uncertainties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground-secondary">
            <ul className="list-disc space-y-1 pl-5">
              {peptide.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
            <CardDescription>Uncertainties</CardDescription>
            <ul className="list-disc space-y-1 pl-5">
              {peptide.uncertainties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>References</CardTitle>
            <CardDescription>{peptide.references.length} curated citations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {peptide.references.map((reference) => (
              <div key={reference.id} className="rounded-[12px] border border-border p-3">
                <p className="font-medium text-foreground">{reference.title}</p>
                <p className="text-foreground-secondary">
                  {reference.authors} · {reference.year}
                  {reference.journal ? ` · ${reference.journal}` : ''}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
