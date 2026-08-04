import compounds from './compounds.json';

type KnowledgeCompound = (typeof compounds)[number];
type KnowledgeCategory = KnowledgeCompound['categories'][number];

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

const INTENT_RULES: {
  patterns: RegExp[];
  categories: KnowledgeCategory[];
  expansions: string[];
}[] = [
  {
    patterns: [
      /\bweight\b/,
      /\blose\b/,
      /\bloss\b/,
      /\bfat\b/,
      /\bobesity\b/,
      /\bglp-?1\b/,
      /\bincretin\b/,
      /\bmetabolic\b/,
      /\bretatrutide\b/,
      /\bsemaglutide\b/,
      /\btirzepatide\b/,
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
    ],
  },
];

const TOKEN_VARIANTS: Record<string, string[]> = {
  lose: ['loss', 'losing', 'weight'],
  loss: ['lose', 'losing', 'weight'],
  weight: ['obesity', 'obese', 'metabolic'],
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsToken(haystack: string, token: string): boolean {
  if (!token || token.length <= 2) return false;
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
  const normalized = query.toLowerCase().trim();
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
    for (const variant of TOKEN_VARIANTS[token] ?? []) terms.add(variant);
  }

  return [...terms];
}

function evidenceBoost(grade: string): number {
  if (grade === 'strong_human') return 18;
  if (grade === 'moderate_human') return 12;
  if (grade === 'limited_human') return 6;
  if (grade === 'early_stage') return 3;
  return 0;
}

function scoreCompound(compound: KnowledgeCompound, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const terms = expandQueryTerms(q);
  if (terms.length === 0) return 0;

  const name = compound.name.toLowerCase();
  const id = compound.id.toLowerCase();
  const aliases = compound.aliases.map((alias) => alias.toLowerCase());
  const blob = [
    compound.name,
    compound.classification,
    compound.summary,
    compound.proposedMechanism,
    compound.researchNotes,
    compound.aliases.join(' '),
    compound.researchAreas.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  const intentCategories = detectIntentCategories(q);
  let score = 0;

  if (name === q) score += 120;
  if (id === q) score += 110;
  if (aliases.some((alias) => alias === q)) score += 100;

  for (const term of terms) {
    if (term.includes(' ')) {
      if (blob.includes(term)) score += 28;
      if (name.includes(term)) score += 40;
      continue;
    }
    if (containsToken(name, term) || name === term) score += 36;
    if (containsToken(id, term) || id === term) score += 28;
    if (aliases.some((alias) => containsToken(alias, term) || alias === term)) {
      score += 24;
    }
    if (containsToken(blob, term) || blob.includes(term)) score += 10;
  }

  if (intentCategories.length > 0) {
    const categoryHit = compound.categories.some((category) =>
      intentCategories.includes(category),
    );
    if (categoryHit) {
      score += 55 + evidenceBoost(compound.humanEvidenceGrade);
    } else {
      score -= 40;
    }
  }

  return score;
}

export function searchKnowledge(query: string, limit = 5): KnowledgeCompound[] {
  return compounds
    .map((compound) => ({ compound, score: scoreCompound(compound, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ compound }) => compound);
}

export function buildKnowledgeContext(query: string, limit = 5): string {
  const matches = searchKnowledge(query, limit);
  if (matches.length === 0) {
    return 'No matching compounds found in the PepGuide knowledge base for this query.';
  }

  return matches
    .map((compound) =>
      [
        `## ${compound.name}`,
        compound.isPeptide
          ? 'Classification: peptide.'
          : `Classification: NOT a peptide — ${compound.classification}.`,
        `Summary: ${compound.summary}`,
        `Mechanism: ${compound.proposedMechanism}`,
        `Human evidence: ${compound.humanEvidenceGrade}`,
        `Regulatory: ${compound.regulatoryDetail ?? compound.regulatoryStatus}`,
        `Risks: ${compound.risks.join('; ')}`,
        `Uncertainties: ${compound.uncertainties.join('; ')}`,
        `Notes: ${compound.researchNotes}`,
      ].join('\n'),
    )
    .join('\n\n');
}
