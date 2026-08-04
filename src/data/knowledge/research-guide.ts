import { KNOWLEDGE_COMPOUNDS } from '@/src/data/knowledge/compounds';
import {
  formatMainEffects,
  getPeptideGuideByIds,
  type PeptideGuideEntry,
} from '@/src/data/knowledge/peptide-guide';

export type ResearchGuideEntry = {
  id: string;
  name: string;
  why: string;
  researchDosing: string;
  mainEffects: string[];
  mainEffectsLabel: string;
};

const PEPTIDE_IDS = new Set(
  KNOWLEDGE_COMPOUNDS.filter((compound) => compound.isPeptide).map(
    (compound) => compound.id,
  ),
);

function toResearchEntry(entry: PeptideGuideEntry): ResearchGuideEntry {
  return {
    id: entry.id,
    name: entry.name,
    why: entry.why,
    researchDosing: entry.researchDosing,
    mainEffects: entry.mainEffects,
    mainEffectsLabel: formatMainEffects(entry),
  };
}

/**
 * Resolve clickable dosing-card entries for chat peptideIds.
 * Peptides only — non-peptides are dropped.
 */
export function getResearchGuideByIds(ids: string[]): ResearchGuideEntry[] {
  const peptideOnly = [...new Set(ids.filter((id) => PEPTIDE_IDS.has(id)))];
  return getPeptideGuideByIds(peptideOnly).map(toResearchEntry);
}
