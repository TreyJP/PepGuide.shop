import { KNOWLEDGE_COMPOUNDS } from './compounds';
import { formatMainEffects, getPeptideGuideById } from './peptide-guide';
import type { KnowledgeCategory, KnowledgeCompound } from './types';

export { KNOWLEDGE_COMPOUNDS } from './compounds';
export type {
  EvidenceGrade,
  KnowledgeCategory,
  KnowledgeCompound,
  KnowledgeReference,
  RegulatoryStatus,
} from './types';
export { PEP_GUIDE_KNOWLEDGE_PREAMBLE } from './system-context';
export type { PeptideGuideEntry } from './peptide-guide';
export {
  PEPTIDE_GUIDE,
  formatMainEffects,
  getAllPeptideGuideEntries,
  getPeptideGuideById,
  getPeptideGuideByIds,
} from './peptide-guide';

const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  metabolic_weight: 'Metabolic / weight research',
  healing_recovery: 'Healing / recovery research',
  cosmetic_skin: 'Cosmetic / skin research',
  sexual_health: 'Sexual health research',
  hair_research: 'Hair research',
  gh_secretagogues: 'GH secretagogue research',
  sleep_circadian: 'Sleep / circadian research',
  cognitive_neuropeptide: 'Cognitive / neuropeptide research',
  general: 'General research',
};

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'about',
  'at',
  'be',
  'can',
  'do',
  'does',
  'for',
  'from',
  'get',
  'have',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'should',
  'take',
  'that',
  'the',
  'this',
  'to',
  'what',
  'which',
  'who',
  'with',
  'would',
  'you',
  'your',
]);

type IntentRule = {
  patterns: RegExp[];
  categories: KnowledgeCategory[];
  expansions: string[];
};

const INTENT_RULES: IntentRule[] = [
  {
    patterns: [
      /\bweight\b/,
      /\blose\b/,
      /\bloss\b/,
      /\bfat\b/,
      /\bobesity\b/,
      /\bobese\b/,
      /\bslim(?:ming)?\b/,
      /\bappetite\b/,
      /\bsatiety\b/,
      /\bhunger\b/,
      /\bhungry\b/,
      /\bcraving\b/,
      /\bglp-?1\b/,
      /\bgip\b/,
      /\bincretin\b/,
      /\bamylin\b/,
      /\bmetabolic\b/,
      /\bdiabetes\b/,
      /\bblood sugar\b/,
      /\bretatrutide\b/,
      /\bsemaglutide\b/,
      /\btirzepatide\b/,
      /\bcagrilintide\b/,
      /\bamycretin\b/,
    ],
    categories: ['metabolic_weight'],
    expansions: [
      'weight loss',
      'obesity',
      'glp-1',
      'incretin',
      'metabolic',
      'satiety',
      'appetite',
      'hunger',
      'amylin',
      'cagrilintide',
      'amycretin',
      'diabetes',
      'body weight',
    ],
  },
  {
    patterns: [/\bheal(?:ing)?\b/, /\brecovery\b/, /\binjury\b/, /\btendon\b/, /\bwound\b/],
    categories: ['healing_recovery'],
    expansions: ['healing', 'recovery', 'injury', 'tissue repair'],
  },
  {
    patterns: [/\bskin\b/, /\bcosmetic\b/, /\bwrinkle\b/, /\bcollagen\b/, /\btan(?:ning)?\b/],
    categories: ['cosmetic_skin'],
    expansions: ['skin', 'cosmetic', 'collagen'],
  },
  {
    patterns: [/\bhair\b/, /\bbald(?:ness)?\b/, /\balopecia\b/],
    categories: ['hair_research'],
    expansions: ['hair', 'alopecia', 'pattern hair loss'],
  },
  {
    patterns: [/\bsleep\b/, /\binsomnia\b/, /\bcircadian\b/],
    categories: ['sleep_circadian'],
    expansions: ['sleep', 'circadian'],
  },
  {
    patterns: [
      /\bgrowth hormone\b/,
      /\bgh\b/,
      /\bsecretagogue\b/,
      /\bigf\b/,
      /\bmuscle\b/,
      /\bhypertrophy\b/,
      /\banabolic\b/,
      /\blean mass\b/,
      /\bbuild muscle\b/,
      /\bgain muscle\b/,
      /\bmuscle gain\b/,
      /\bgains?\b/,
    ],
    categories: ['gh_secretagogues'],
    expansions: [
      'growth hormone',
      'secretagogue',
      'gh',
      'muscle',
      'lean mass',
      'hypertrophy',
      'igf-1',
      'ipamorelin',
      'cjc-1295',
      'sermorelin',
    ],
  },
  {
    patterns: [/\bcognitive\b/, /\bmemory\b/, /\bfocus\b/, /\bneuropeptide\b/],
    categories: ['cognitive_neuropeptide'],
    expansions: ['cognitive', 'neuropeptide', 'memory'],
  },
  {
    patterns: [/\bsexual\b/, /\blibido\b/, /\berectile\b/],
    categories: ['sexual_health'],
    expansions: ['sexual health', 'libido'],
  },
];

const TOKEN_VARIANTS: Record<string, string[]> = {
  lose: ['loss', 'losing', 'weight'],
  loss: ['lose', 'losing', 'weight'],
  weight: ['obesity', 'obese', 'metabolic'],
  fat: ['obesity', 'adipose', 'weight'],
  slim: ['weight', 'obesity'],
  slimming: ['weight', 'obesity'],
  muscle: ['hypertrophy', 'lean mass', 'anabolic', 'igf'],
  gains: ['muscle', 'hypertrophy', 'lean mass'],
  gain: ['muscle', 'hypertrophy', 'lean mass'],
};

function normalizeSearchText(value: string): string {
  return value.toLowerCase().trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Prefer whole-word matches so short tokens like "to" cannot hit inside names. */
function containsToken(haystack: string, token: string): boolean {
  if (!token) return false;
  if (token.length <= 2) return false;
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(token)}(?:[^a-z0-9]|$)`, 'i');
  return pattern.test(haystack);
}

function detectIntentCategories(query: string): KnowledgeCategory[] {
  const categories = new Set<KnowledgeCategory>();
  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(query))) {
      for (const category of rule.categories) categories.add(category);
    }
  }
  return [...categories];
}

function expandQueryTerms(query: string): string[] {
  const normalized = normalizeSearchText(query);
  const terms = new Set<string>();

  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      for (const expansion of rule.expansions) terms.add(expansion);
    }
  }

  const rawTokens = normalized
    .split(/[^a-z0-9+-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));

  for (const token of rawTokens) {
    terms.add(token);
    for (const variant of TOKEN_VARIANTS[token] ?? []) {
      terms.add(variant);
    }
  }

  return [...terms];
}

function compoundSearchBlob(compound: KnowledgeCompound): string {
  const guide = getPeptideGuideById(compound.id);
  return [
    compound.name,
    compound.classification,
    compound.summary,
    compound.proposedMechanism,
    compound.researchNotes,
    compound.regulatoryDetail ?? '',
    compound.aliases.join(' '),
    compound.categories.map((c) => CATEGORY_LABELS[c]).join(' '),
    compound.researchAreas.join(' '),
    compound.risks.join(' '),
    compound.uncertainties.join(' '),
    guide ? formatMainEffects(guide) : '',
    guide?.why ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

function evidenceBoost(grade: KnowledgeCompound['humanEvidenceGrade']): number {
  switch (grade) {
    case 'strong_human':
      return 18;
    case 'moderate_human':
      return 12;
    case 'limited_human':
      return 6;
    case 'early_stage':
      return 3;
    default:
      return 0;
  }
}

/** Prefer core incretin / obesity research leads when intent is metabolic. */
const METABOLIC_PRIMARY = new Set([
  'retatrutide',
  'tirzepatide',
  'semaglutide',
]);
const METABOLIC_SECONDARY = new Set([
  'cagrilintide',
  'survodutide',
  'mazdutide',
  'amycretin',
  'orforglipron',
]);

function scoreCompound(compound: KnowledgeCompound, query: string): number {
  const q = normalizeSearchText(query);
  if (!q) return 0;

  const terms = expandQueryTerms(q);
  if (terms.length === 0) return 0;

  const name = normalizeSearchText(compound.name);
  const id = normalizeSearchText(compound.id);
  const aliases = compound.aliases.map((alias) => normalizeSearchText(alias));
  const blob = compoundSearchBlob(compound);
  const intentCategories = detectIntentCategories(q);

  let score = 0;

  if (name === q) score += 120;
  if (id === q) score += 110;
  if (aliases.some((alias) => alias === q)) score += 100;

  for (const term of terms) {
    const multiWord = term.includes(' ');
    if (multiWord) {
      if (blob.includes(term)) score += 28;
      if (name.includes(term)) score += 40;
      continue;
    }

    if (containsToken(name, term) || name === term) score += 36;
    if (containsToken(id, term) || id === term) score += 28;
    if (aliases.some((alias) => containsToken(alias, term) || alias === term)) score += 24;
    if (containsToken(blob, term) || blob.includes(term)) score += 10;
  }

  if (intentCategories.length > 0) {
    const categoryHit = compound.categories.some((category) =>
      intentCategories.includes(category),
    );
    if (categoryHit) {
      score += 55 + evidenceBoost(compound.humanEvidenceGrade);
      if (intentCategories.includes('metabolic_weight')) {
        const appetiteFocus =
          /\b(appetite|hunger|hungry|satiety|craving|amylin|cagrilintide|amycretin)\b/i.test(
            q,
          );
        if (appetiteFocus) {
          // Prefer amylin / satiety complements over re-ranking the same top incretins.
          if (compound.id === 'cagrilintide' || compound.id === 'amycretin') {
            score += 55;
          } else if (METABOLIC_SECONDARY.has(compound.id)) {
            score += 25;
          } else if (METABOLIC_PRIMARY.has(compound.id)) {
            score += 15;
          }
        } else if (METABOLIC_PRIMARY.has(compound.id)) {
          score += 45;
        } else if (METABOLIC_SECONDARY.has(compound.id)) {
          score += 20;
        }
      }
    } else {
      // Strongly demote off-topic hits when intent is clear.
      score -= 40;
    }
  }

  return score;
}

/** PepGuide public lists / chat recommendations: peptides only. */
export function getPeptideCompounds(): KnowledgeCompound[] {
  return KNOWLEDGE_COMPOUNDS.filter((compound) => compound.isPeptide);
}

export function isPeptideId(id: string): boolean {
  return Boolean(getCompoundById(id)?.isPeptide);
}

export function filterPeptideIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => isPeptideId(id)))];
}

export function searchKnowledge(query: string, limit = 10): KnowledgeCompound[] {
  const peptides = getPeptideCompounds();
  const trimmed = query.trim();
  if (!trimmed) return peptides.slice(0, limit);

  return peptides
    .map((compound) => ({
      compound,
      score: scoreCompound(compound, trimmed),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ compound }) => compound);
}

export function getCompoundById(id: string): KnowledgeCompound | undefined {
  return KNOWLEDGE_COMPOUNDS.find((c) => c.id === id);
}

export function getCompoundsByCategory(category: KnowledgeCategory): KnowledgeCompound[] {
  return getPeptideCompounds().filter((c) => c.categories.includes(category));
}

function formatEvidenceGrade(grade: KnowledgeCompound['humanEvidenceGrade']): string {
  const labels: Record<KnowledgeCompound['humanEvidenceGrade'], string> = {
    strong_human: 'Strong human evidence',
    moderate_human: 'Moderate human evidence',
    limited_human: 'Limited human evidence',
    early_stage: 'Early-stage research',
    preclinical_only: 'Preclinical only',
    anecdotal: 'Anecdotal or unsupported',
    insufficient: 'Insufficient information',
  };
  return labels[grade];
}

function formatRegulatoryStatus(compound: KnowledgeCompound): string {
  const base: Record<KnowledgeCompound['regulatoryStatus'], string> = {
    fda_approved_specific: 'FDA approved for specific indication(s)',
    approved_outside_us: 'Approved outside the United States',
    investigational: 'Investigational',
    compounded_limited: 'Compounded in limited circumstances',
    not_fda_approved: 'Not FDA approved',
    research_stage: 'Research-stage compound',
    withdrawn: 'Withdrawn or discontinued',
    unknown: 'Unknown regulatory status',
  };
  const label = base[compound.regulatoryStatus];
  return compound.regulatoryDetail ? `${label}. ${compound.regulatoryDetail}` : label;
}

export function buildKnowledgeContext(query: string, limit = 5): string {
  const matches = searchKnowledge(query, limit);
  if (matches.length === 0) {
    return 'No matching compounds found in the PepGuide knowledge base for this query.';
  }

  const sections = matches.map((compound) => {
    const guide = getPeptideGuideById(compound.id);
    const peptideNote = compound.isPeptide
      ? 'Classification: peptide.'
      : `Classification: NOT a peptide — ${compound.classification}.`;

    const refs = compound.references
      .slice(0, 3)
      .map((r) => `- ${r.title} (${r.authors}, ${r.year}${r.journal ? `, ${r.journal}` : ''})`)
      .join('\n');

    return [
      `## ${compound.name} (${compound.id})`,
      peptideNote,
      `Categories: ${compound.categories.map((c) => CATEGORY_LABELS[c]).join(', ')}`,
      guide
        ? `Main effects: ${formatMainEffects(guide)}`
        : `Research areas: ${compound.researchAreas.join(', ')}`,
      guide ? `Research dosing: ${guide.researchDosing}` : '',
      `Summary: ${compound.summary}`,
      `Proposed mechanism: ${compound.proposedMechanism}`,
      `Human evidence: ${formatEvidenceGrade(compound.humanEvidenceGrade)}`,
      `Preclinical evidence: ${formatEvidenceGrade(compound.preclinicalEvidenceGrade)}`,
      `Regulatory status: ${formatRegulatoryStatus(compound)}`,
      `Risks: ${compound.risks.join('; ')}`,
      `Uncertainties: ${compound.uncertainties.join('; ')}`,
      `Research notes: ${compound.researchNotes}`,
      refs ? `References:\n${refs}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  });

  return [
    'PepGuide Research Brief (educational only — not medical advice)',
    'Prioritize the compounds below. Prefer higher human-evidence metabolic compounds when the question is about weight or obesity research.',
    '',
    ...sections,
    '',
    'Reminder: You may include published trial/label research dosing ranges. Do not invent personal prescriptions, injection technique, reconstitution steps, or vendor/sourcing guidance.',
  ].join('\n\n');
}
