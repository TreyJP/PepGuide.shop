import { getLowestAffiliatePrice } from '@/src/data/affiliates/slots';
import { filterPeptideIds, getCompoundById } from '@/src/data/knowledge';
import { METABOLIC_TIER_GUIDE } from '@/src/data/knowledge/metabolic-guide';
import { getPeptideGuideById } from '@/src/data/knowledge/peptide-guide';

export type RankedAffiliatePick = {
  rank: 1 | 2 | 3;
  peptideId: string;
  name: string;
  reason: string;
  mainEffects: string[];
  fromPriceUsd: number | null;
};

const METABOLIC_ORDER = new Map(
  METABOLIC_TIER_GUIDE.map((entry, index) => [entry.id, index]),
);

/**
 * Rank the top 3 compounds from a chat response for affiliate display.
 * Prefers metabolic tier order when present; otherwise keeps response order.
 */
export function rankTopAffiliatePicks(
  peptideIds: string[],
  limit = 3,
): RankedAffiliatePick[] {
  const unique = filterPeptideIds(peptideIds);
  if (unique.length === 0) return [];

  const sorted = [...unique].sort((a, b) => {
    const aRank = METABOLIC_ORDER.get(a);
    const bRank = METABOLIC_ORDER.get(b);
    if (aRank != null && bRank != null) return aRank - bRank;
    if (aRank != null) return -1;
    if (bRank != null) return 1;
    return unique.indexOf(a) - unique.indexOf(b);
  });

  return sorted.slice(0, limit).map((peptideId, index) => {
    const compound = getCompoundById(peptideId);
    const guide = getPeptideGuideById(peptideId);
    return {
      rank: (index + 1) as 1 | 2 | 3,
      peptideId,
      name: compound?.name ?? guide?.name ?? peptideId,
      reason:
        guide?.why ??
        compound?.summary ??
        'Relevant to this research topic.',
      mainEffects: guide?.mainEffects ?? [],
      fromPriceUsd: getLowestAffiliatePrice(peptideId),
    };
  });
}
