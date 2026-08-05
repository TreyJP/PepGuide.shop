'use client';

import { useMemo, useState } from 'react';

import { AffiliateModal } from '@/src/components/affiliates/affiliate-modal';
import { AddToCycleModal } from '@/src/components/cycle/add-to-cycle-modal';
import { DosingGuide } from '@/src/components/chat/dosing-guide';
import { MorePeptidesModal } from '@/src/components/chat/more-peptides-modal';
import { filterPeptideIds } from '@/src/data/knowledge';
import { getWeightLossGuideIds } from '@/src/data/knowledge/metabolic-guide';
import { getMuscleTopIds } from '@/src/data/knowledge/muscle-guide';
import { getResearchGuideByIds } from '@/src/data/knowledge/research-guide';

export type WeightLossReplyProps = {
  peptideIds: string[];
};

function isDualGoalList(ids: string[]): boolean {
  if (ids.length < 2) return false;
  const weightSet = new Set(getWeightLossGuideIds(12));
  const muscleSet = new Set(getMuscleTopIds(8));
  return weightSet.has(ids[0]!) && muscleSet.has(ids[1]!);
}

export function WeightLossReply({ peptideIds }: WeightLossReplyProps) {
  const ids = useMemo(() => filterPeptideIds(peptideIds), [peptideIds]);
  const dualGoal = useMemo(() => isDualGoalList(ids), [ids]);
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
        previewLimit={dualGoal ? 2 : 3}
        goalLabels={
          dualGoal ? ['Weight loss', 'Muscle / lean mass'] : undefined
        }
        title={dualGoal ? 'One pick per goal' : 'Start low, then increase'}
        subtitle={
          dualGoal
            ? 'Primary research option for fat loss and for lean mass — educational ranges only, not a personal protocol.'
            : undefined
        }
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
