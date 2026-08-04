'use client';

import Link from 'next/link';
import { GitCompare, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { evidenceLabel, evidenceTone, regulatoryLabel } from '@/src/lib/evidence';
import { peptideRepository } from '@/src/services/firestore/peptides';
import { useComparisonStore } from '@/src/stores/comparison-store';
import type { Peptide } from '@/src/types';

const COMPARISON_ROWS = [
  { key: 'classification', label: 'Classification' },
  { key: 'humanEvidence', label: 'Human evidence' },
  { key: 'regulatoryStatus', label: 'Regulatory status' },
  { key: 'mechanism', label: 'Proposed mechanism' },
] as const;

export default function ComparePage() {
  const peptideIds = useComparisonStore((state) => state.peptideIds);
  const removePeptide = useComparisonStore((state) => state.removePeptide);
  const clear = useComparisonStore((state) => state.clear);
  const [peptides, setPeptides] = useState<Peptide[]>([]);

  useEffect(() => {
    if (peptideIds.length === 0) {
      setPeptides([]);
      return;
    }
    void peptideRepository.getByIds(peptideIds).then(setPeptides);
  }, [peptideIds]);

  const getCellValue = (peptide: Peptide, key: (typeof COMPARISON_ROWS)[number]['key']) => {
    switch (key) {
      case 'classification':
        return peptide.classification;
      case 'humanEvidence':
        return evidenceLabel(peptide.humanEvidenceGrade);
      case 'regulatoryStatus':
        return regulatoryLabel(peptide.regulatoryStatus, peptide.regulatoryDetail);
      case 'mechanism':
        return peptide.proposedMechanism;
      default:
        return '';
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Compare compounds
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Neutral side-by-side research differences (up to 4 compounds).
          </p>
        </div>
        {peptideIds.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear all
          </Button>
        ) : null}
      </header>

      <div className="flex-1 overflow-auto p-6">
        {peptides.length === 0 ? (
          <EmptyState
            icon={GitCompare}
            title="No compounds selected"
            description="Add peptides from the library to build a comparison table."
            action={
              <Link href="/library">
                <Button>Browse library</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-[14px] border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-secondary/60">
                <tr>
                  <th className="px-4 py-3 font-medium text-foreground-secondary">Attribute</th>
                  {peptides.map((peptide) => (
                    <th key={peptide.id} className="min-w-48 px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">{peptide.name}</p>
                          <Badge
                            variant={evidenceTone(peptide.humanEvidenceGrade)}
                            className="mt-2"
                          >
                            {evidenceLabel(peptide.humanEvidenceGrade)}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePeptide(peptide.id)}
                          className="rounded-[8px] p-1 text-foreground-secondary hover:bg-surface-secondary hover:text-foreground"
                          aria-label={`Remove ${peptide.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                    {peptides.map((peptide) => (
                      <td
                        key={`${peptide.id}-${row.key}`}
                        className="px-4 py-3 align-top text-foreground-secondary"
                      >
                        {getCellValue(peptide, row.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
