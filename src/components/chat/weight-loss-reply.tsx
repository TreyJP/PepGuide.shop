'use client';

import { useMemo, useState } from 'react';

import { AffiliateModal } from '@/src/components/affiliates/affiliate-modal';
import { AddToCycleModal } from '@/src/components/cycle/add-to-cycle-modal';
import { DosingGuide } from '@/src/components/chat/dosing-guide';
import { MorePeptidesModal } from '@/src/components/chat/more-peptides-modal';
import { filterPeptideIds } from '@/src/data/knowledge';
import { getResearchGuideByIds } from '@/src/data/knowledge/research-guide';

export type WeightLossReplyProps = {
  peptideIds: string[];
};

export function WeightLossReply({ peptideIds }: WeightLossReplyProps) {
  const ids = useMemo(() => filterPeptideIds(peptideIds), [peptideIds]);
  const entries = useMemo(() => getResearchGuideByIds(ids), [ids]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cycleId, setCycleId] = useState<string | null>(null);

  const selected = entries.find((entry) => entry.id === selectedId) ?? null;
  const cycleEntry = entries.find((entry) => entry.id === cycleId) ?? null;
  const selectedRank = selected
    ? entries.findIndex((entry) => entry.id === selected.id) + 1
    : 0;

  const openPrices = (peptideId: string) => {
    setMoreOpen(false);
    setSelectedId(peptideId);
  };

  return (
    <div className="min-w-0 space-y-5">
      <DosingGuide
        peptideIds={ids}
        previewLimit={3}
        onSelect={openPrices}
        onAddToCycle={setCycleId}
        onViewMore={() => setMoreOpen(true)}
      />

      <MorePeptidesModal
        open={moreOpen}
        peptideIds={ids}
        onClose={() => setMoreOpen(false)}
        onSelect={openPrices}
        onAddToCycle={(peptideId) => {
          setMoreOpen(false);
          setCycleId(peptideId);
        }}
      />

      {selected ? (
        <AffiliateModal
          open
          peptideId={selected.id}
          peptideName={selected.name}
          rank={selectedRank}
          onClose={() => setSelectedId(null)}
        />
      ) : null}

      {cycleEntry ? (
        <AddToCycleModal
          open
          peptideId={cycleEntry.id}
          peptideName={cycleEntry.name}
          suggestedDose={cycleEntry.researchDosing}
          onClose={() => setCycleId(null)}
        />
      ) : null}
    </div>
  );
}
