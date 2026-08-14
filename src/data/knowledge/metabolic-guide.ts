import { findMentionedCompoundIds } from './mentions';

export type EfficacyTier = 'S' | 'A' | 'B' | 'C';

export type MetabolicGuideEntry = {
  id: string;
  name: string;
  tier: EfficacyTier;
  why: string;
  /** Compact start-low → increase titration note. */
  researchDosing: string;
  evidenceNote: string;
};

/**
 * Weight / metabolic research tier list used to format chat answers.
 * Dosing strings are study/label ranges, not personal medical advice.
 */
export const METABOLIC_TIER_GUIDE: MetabolicGuideEntry[] = [
  {
    id: 'retatrutide',
    name: 'GL3RT',
    tier: 'S',
    why: 'Top phase-2 weight-loss signal (triple agonist).',
    researchDosing: 'Start ~1–2 mg/wk → increase only if needed, up to ~12 mg/wk.',
    evidenceNote: 'Moderate human',
  },
  {
    id: 'tirzepatide',
    name: 'GL2TZ',
    tier: 'S',
    why: 'Dual agonist; strongest approved-class results.',
    researchDosing: 'Start 2.5 mg/wk ×4 → step up every 4 wks only if needed (to 15 mg).',
    evidenceNote: 'Strong human',
  },
  {
    id: 'semaglutide',
    name: 'GL1SM',
    tier: 'S',
    why: 'Best-studied GLP-1 for weight management.',
    researchDosing: 'Start 0.25 mg/wk ×4 → step up only if needed (to 2.4 mg).',
    evidenceNote: 'Strong human',
  },
  {
    id: 'cagrilintide',
    name: 'Cagrilintide',
    tier: 'A',
    why: 'Best hunger / satiety-path peptide (amylin); strong alone and in combo (CagriSema).',
    researchDosing: 'Start low weekly → raise only if needed (trials often → ~2.4 mg).',
    evidenceNote: 'Moderate human',
  },
  {
    id: 'mazdutide',
    name: 'Mazdutide',
    tier: 'A',
    why: 'GLP-1/glucagon dual agonist; solid phase-2 data.',
    researchDosing: 'Start low weekly → increase only if needed (studied ~6–9 mg).',
    evidenceNote: 'Limited human',
  },
  {
    id: 'survodutide',
    name: 'Survodutide',
    tier: 'A',
    why: 'Dual agonist with weight + liver-fat signals.',
    researchDosing: 'Start ~0.6 mg/wk → increase only if needed (studied to ~4.8 mg).',
    evidenceNote: 'Limited human',
  },
  {
    id: 'amycretin',
    name: 'Amycretin',
    tier: 'A',
    why: 'Early GLP-1/amylin co-agonist; strong early signal.',
    researchDosing: 'Start lowest weekly step → increase only if needed.',
    evidenceNote: 'Early-stage',
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    tier: 'B',
    why: 'Visceral-fat reduction in labeled contexts.',
    researchDosing: 'Typically fixed 2 mg/day in labeled use — not a general ladder.',
    evidenceNote: 'Labeled niche use',
  },
  {
    id: 'mots-c',
    name: 'MOTS-c',
    tier: 'B',
    why: 'Metabolic peptide interest; weak human dosing data.',
    researchDosing: 'No standard dose — start lowest researched amount only.',
    evidenceNote: 'Early-stage',
  },
  {
    id: 'aod-9604',
    name: 'AOD-9604',
    tier: 'C',
    why: 'Weak/inconsistent fat-loss evidence.',
    researchDosing: 'No reliable effective titration.',
    evidenceNote: 'Insufficient',
  },
];

export const TIER_LABELS: Record<EfficacyTier, string> = {
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
};

export function getMetabolicGuideByIds(ids: string[]): MetabolicGuideEntry[] {
  const order = new Map(METABOLIC_TIER_GUIDE.map((entry, index) => [entry.id, index]));
  return METABOLIC_TIER_GUIDE.filter((entry) => ids.includes(entry.id)).sort(
    (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
  );
}

/** Weight-loss answers stay on core metabolic compounds only (S-tier by default). */
export function buildMetabolicTiersMarkdown(
  ids?: string[],
  options?: { tiers?: EfficacyTier[] },
): string {
  const allowedTiers = options?.tiers ?? (['S'] as EfficacyTier[]);
  const entries = ids?.length
    ? getMetabolicGuideByIds(ids).filter((entry) => allowedTiers.includes(entry.tier))
    : METABOLIC_TIER_GUIDE.filter((entry) => allowedTiers.includes(entry.tier));

  const lines = entries.map(
    (entry) =>
      `- **${entry.name}** (${entry.evidenceNote}) — ${entry.why}  
  Dose: ${entry.researchDosing}`,
  );

  return [
    'Weight-loss research overview (not medical advice). Start low; increase only if effects stay limited and side effects are okay.',
    '',
    '**Top weight-loss research options**',
    lines.join('\n'),
    '',
    'Ask for a side-effect compare or a deeper look at any one compound.',
  ].join('\n');
}

export function getWeightLossTopIds(limit = 3): string[] {
  return METABOLIC_TIER_GUIDE.filter((entry) => entry.tier === 'S')
    .slice(0, limit)
    .map((entry) => entry.id);
}

/** Broader metabolic peptide list for preview cards + View more modal. */
export function getWeightLossGuideIds(limit = 8): string[] {
  const tierRank: Record<EfficacyTier, number> = { S: 0, A: 1, B: 2, C: 3 };
  return [...METABOLIC_TIER_GUIDE]
    .sort((a, b) => tierRank[a.tier] - tierRank[b.tier])
    .slice(0, limit)
    .map((entry) => entry.id);
}

/** Amylin / appetite-complement peptide options — cagrilintide (cag) first for hunger. */
export function getAppetiteComplementIds(limit = 3): string[] {
  const preferred = ['cagrilintide', 'amycretin'];
  return preferred
    .filter((id) => METABOLIC_TIER_GUIDE.some((entry) => entry.id === id))
    .slice(0, limit);
}

/**
 * Hunger / satiety shortlist — cagrilintide leads; incretins follow as peers.
 */
export function getHungerGuideIds(limit = 8): string[] {
  const hungerFirst = ['cagrilintide', 'amycretin'];
  const rest = getWeightLossGuideIds(12).filter(
    (id) => !hungerFirst.includes(id),
  );
  return [...hungerFirst, ...rest]
    .filter((id) => METABOLIC_TIER_GUIDE.some((entry) => entry.id === id))
    .slice(0, limit);
}

/** Match metabolic guide compounds mentioned in free text (incl. slang). */
export function findMentionedMetabolicIds(text: string): string[] {
  const metabolicIds = new Set(METABOLIC_TIER_GUIDE.map((entry) => entry.id));
  return findMentionedCompoundIds(text).filter((id) => metabolicIds.has(id));
}
