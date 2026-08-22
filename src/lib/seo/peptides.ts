import { KNOWLEDGE_COMPOUNDS } from '@/src/data/knowledge/compounds';
import type { KnowledgeCompound } from '@/src/data/knowledge/types';
import { LIBRARY_CATEGORY_ORDER } from '@/src/data/peptides';

const CATEGORY_LABELS: Record<string, string> = {
  metabolic_weight: 'Metabolic research',
  healing_recovery: 'Recovery / injury research',
  cosmetic_skin: 'Skin / cosmetic research',
  sexual_health: 'Sexual health research',
  hair_research: 'Hair research',
  gh_secretagogues: 'GH axis research',
  sleep_circadian: 'Sleep / circadian research',
  cognitive_neuropeptide: 'Cognitive / neuropeptide research',
  general: 'General research',
};

export function getSeoDisplayName(compound: KnowledgeCompound): string {
  const primaryAlias = compound.aliases.find(
    (alias) => alias.trim().length >= 3 && !/^[A-Z0-9-]{2,8}$/.test(alias.trim()),
  );
  return (primaryAlias ?? compound.aliases[0] ?? compound.name).trim();
}

export function getIndexablePeptides(): KnowledgeCompound[] {
  return KNOWLEDGE_COMPOUNDS.filter(
    (c) =>
      c.isPeptide &&
      c.summary.trim().length >= 40 &&
      c.proposedMechanism.trim().length >= 40 &&
      c.researchNotes.trim().length >= 80,
  );
}

export function getPeptideBySlug(slug: string): KnowledgeCompound | undefined {
  const normalized = slug.trim().toLowerCase();
  return getIndexablePeptides().find((c) => c.id === normalized);
}

export function isPeptideIndexable(compound: KnowledgeCompound): boolean {
  return getIndexablePeptides().some((c) => c.id === compound.id);
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function peptidesByCategory(): Array<{
  category: string;
  label: string;
  peptides: KnowledgeCompound[];
}> {
  const peptides = getIndexablePeptides();
  const groups = new Map<string, KnowledgeCompound[]>();

  for (const peptide of peptides) {
    const key = peptide.categories[0] ?? 'general';
    const list = groups.get(key) ?? [];
    list.push(peptide);
    groups.set(key, list);
  }

  const orderedKeys = [
    ...LIBRARY_CATEGORY_ORDER.map((label) => {
      const entry = Object.entries(CATEGORY_LABELS).find(([, v]) => v === label);
      return entry?.[0];
    }).filter(Boolean) as string[],
    ...[...groups.keys()].filter((k) => !CATEGORY_LABELS[k] || !LIBRARY_CATEGORY_ORDER.includes(CATEGORY_LABELS[k]!)),
  ];

  const uniqueKeys = [...new Set(orderedKeys)].filter((k) => groups.has(k));

  return uniqueKeys.map((category) => ({
    category,
    label: categoryLabel(category),
    peptides: (groups.get(category) ?? []).sort((a, b) =>
      getSeoDisplayName(a).localeCompare(getSeoDisplayName(b)),
    ),
  }));
}

export function relatedPeptides(
  compound: KnowledgeCompound,
  limit = 6,
): KnowledgeCompound[] {
  const shared = new Set(compound.categories);
  return getIndexablePeptides()
    .filter((c) => c.id !== compound.id)
    .map((c) => ({
      compound: c,
      score: c.categories.reduce((n, cat) => n + (shared.has(cat) ? 2 : 0), 0),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || getSeoDisplayName(a.compound).localeCompare(getSeoDisplayName(b.compound)))
    .slice(0, limit)
    .map((row) => row.compound);
}

export function evidenceGradeLabel(grade: string): string {
  switch (grade) {
    case 'strong_human':
      return 'Strong human evidence';
    case 'moderate_human':
      return 'Moderate human evidence';
    case 'limited_human':
      return 'Limited human evidence';
    case 'early_stage':
      return 'Early-stage human research';
    case 'preclinical_only':
      return 'Preclinical evidence primarily';
    case 'anecdotal':
      return 'Mostly anecdotal reports';
    default:
      return 'Insufficient evidence summarized';
  }
}

export function regulatoryLabel(status: string): string {
  switch (status) {
    case 'fda_approved_specific':
      return 'FDA-approved for specific labeled indications';
    case 'approved_outside_us':
      return 'Approved outside the U.S. (context-specific)';
    case 'investigational':
      return 'Investigational';
    case 'compounded_limited':
      return 'Compounding / limited contexts';
    case 'not_fda_approved':
      return 'Not FDA-approved';
    case 'research_stage':
      return 'Research-stage';
    case 'withdrawn':
      return 'Withdrawn / restricted';
    default:
      return 'Status unclear or not summarized';
  }
}

export function buildPeptideFaqs(compound: KnowledgeCompound): Array<{
  question: string;
  answer: string;
}> {
  const name = getSeoDisplayName(compound);
  const faqs = [
    {
      question: `What is ${name}?`,
      answer: compound.summary,
    },
    {
      question: `How does ${name} work (proposed mechanism)?`,
      answer: compound.proposedMechanism,
    },
    {
      question: `What is ${name} being researched for?`,
      answer:
        compound.researchAreas.length > 0
          ? `${name} has been discussed in research contexts including: ${compound.researchAreas.join(', ')}.`
          : `${name} research areas are summarized in the PepGuide compound profile.`,
    },
    {
      question: `What does current evidence say about ${name}?`,
      answer: `${evidenceGradeLabel(compound.humanEvidenceGrade)}. ${compound.researchNotes.slice(0, 420)}${compound.researchNotes.length > 420 ? '…' : ''}`,
    },
    {
      question: `What safety considerations are noted for ${name}?`,
      answer:
        compound.knownAdverseEffects.length > 0 || compound.risks.length > 0
          ? `Reported or discussed considerations include: ${[...compound.knownAdverseEffects, ...compound.risks].slice(0, 8).join('; ')}. This is educational information, not medical advice.`
          : `Safety characterization for ${name} remains limited in publicly summarized sources. PepGuide does not provide medical advice.`,
    },
    {
      question: `Is ${name} FDA approved?`,
      answer: `${regulatoryLabel(compound.regulatoryStatus)}${compound.regulatoryDetail ? `. ${compound.regulatoryDetail}` : '.'}`,
    },
  ];
  return faqs.filter((f) => f.answer.trim().length >= 40);
}
