import {
  getSponsorCompoundIds,
  getSponsorSearchAliasesByCompoundId,
} from '@/src/data/affiliates/sponsor-compounds';
import { KNOWLEDGE_COMPOUNDS } from '@/src/data/knowledge/compounds';
import type { KnowledgeCompound } from '@/src/data/knowledge/types';
import type { Citation, EvidenceGrade, Peptide, RegulatoryStatus } from '@/src/types';

const SPONSOR_COMPOUND_IDS = getSponsorCompoundIds();
const SPONSOR_SEARCH_ALIASES = getSponsorSearchAliasesByCompoundId();

const CATEGORY_TO_RESEARCH: Record<string, string> = {
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

/** Display order for Library sections (by research function). */
export const LIBRARY_CATEGORY_ORDER = Object.values(CATEGORY_TO_RESEARCH);

function mapCategories(compound: KnowledgeCompound): string[] {
  const mapped = compound.categories.map((c) => CATEGORY_TO_RESEARCH[c] ?? c);
  return [...new Set(mapped)];
}

function deriveHumanEvidenceSummary(compound: KnowledgeCompound): string {
  const grade = compound.humanEvidenceGrade;
  switch (grade) {
    case 'strong_human':
      return 'Multiple controlled human studies and/or regulatory approvals support findings within studied populations.';
    case 'moderate_human':
      return 'Human clinical data exist but may be limited to specific populations, durations, or trial phases.';
    case 'limited_human':
      return 'Some human data exist, but robust controlled trials are sparse or inconclusive.';
    case 'early_stage':
      return 'Early-phase human research only; conclusions should be considered preliminary.';
    case 'preclinical_only':
      return 'Evidence is primarily from animal or in-vitro models; human relevance is uncertain.';
    case 'anecdotal':
      return 'Claims rely largely on anecdotal reports without rigorous human trial support.';
    default:
      return 'Insufficient peer-reviewed human evidence to draw firm conclusions.';
  }
}

function deriveAnimalEvidenceSummary(compound: KnowledgeCompound): string {
  const refs = compound.references.filter((r) => r.evidenceType === 'animal');
  if (refs.length > 0) {
    return `Animal or preclinical studies include work such as "${refs[0].title}" (${refs[0].year}). Translation to humans requires caution.`;
  }
  if (compound.preclinicalEvidenceGrade === 'preclinical_only' || compound.preclinicalEvidenceGrade === 'early_stage') {
    return 'Preclinical models have explored proposed mechanisms; human translation remains uncertain.';
  }
  return 'Preclinical characterization informed early development; human programs may exist for some indications.';
}

function deriveInvitroSummary(compound: KnowledgeCompound): string {
  const refs = compound.references.filter((r) => r.evidenceType === 'in_vitro');
  if (refs.length > 0) {
    return `In-vitro work includes "${refs[0].title}" (${refs[0].year}), supporting mechanistic hypotheses.`;
  }
  return 'Mechanistic and receptor-level studies support proposed pathways where published.';
}

function deriveStudiedRoutes(compound: KnowledgeCompound): string[] {
  if (compound.id === 'nasal-delivery-general') {
    return ['Intranasal (research context; bioavailability often poorly characterized)'];
  }
  if (compound.categories.includes('cosmetic_skin') && compound.researchAreas.some((a) => a.toLowerCase().includes('cosmetic'))) {
    return ['Topical (cosmetic research)', 'Various routes under investigation'];
  }
  if (!compound.isPeptide && compound.classification.toLowerCase().includes('oral')) {
    return ['Oral (studied formulations)', 'Research routes vary by compound'];
  }
  if (compound.regulatoryStatus === 'fda_approved_specific') {
    return ['Approved labeled route(s)', 'Other routes investigational or unvalidated'];
  }
  return ['Research settings (route-specific evidence varies)', 'Nasal bioavailability poorly characterized for many peptides'];
}

function deriveContraindications(compound: KnowledgeCompound): string[] {
  const items: string[] = [];
  if (compound.regulatoryStatus === 'not_fda_approved' || compound.regulatoryStatus === 'research_stage') {
    items.push('Not established for clinical use outside research contexts');
  }
  if (compound.risks.some((r) => r.toLowerCase().includes('cardiovascular'))) {
    items.push('Cardiovascular risk considerations in studied or theoretical contexts');
  }
  if (compound.risks.some((r) => r.toLowerCase().includes('wada') || r.toLowerCase().includes('prohibited'))) {
    items.push('Prohibited or restricted in competitive sport contexts (WADA-related)');
  }
  if (items.length === 0) {
    items.push('Refer to indication-specific labeling where approved products exist');
  }
  return items;
}

function deriveInteractions(compound: KnowledgeCompound): string[] {
  const items: string[] = [];
  const text = `${compound.researchNotes} ${compound.risks.join(' ')}`.toLowerCase();
  if (text.includes('serotonin') || text.includes('ssri')) {
    items.push('Serotonergic drug interactions reported or theoretical');
  }
  if (text.includes('nitrate') || text.includes('pde5')) {
    items.push('Nitrate co-administration contraindicated (PDE5 class)');
  }
  if (text.includes('glucose') || text.includes('insulin') || compound.categories.includes('metabolic_weight')) {
    items.push('Glucose-lowering or metabolic drug interactions possible');
  }
  if (items.length === 0) {
    items.push('Interaction data limited; consult primary literature for compound-specific reports');
  }
  return items;
}

function toCitation(ref: KnowledgeCompound['references'][number]): Citation {
  return {
    id: ref.id,
    title: ref.title,
    authors: ref.authors,
    year: ref.year,
    journal: ref.journal,
    evidenceType: ref.evidenceType,
  };
}

function knowledgeToPeptide(compound: KnowledgeCompound): Peptide {
  const sponsorAliases = SPONSOR_SEARCH_ALIASES.get(compound.id) ?? [];
  const aliases = [
    ...new Set(
      [...compound.aliases, ...sponsorAliases].map((alias) => alias.trim()).filter(Boolean),
    ),
  ];

  return {
    id: compound.id,
    name: compound.name,
    aliases,
    classification: compound.isPeptide
      ? compound.classification
      : `${compound.classification} [Non-peptide research compound]`,
    shortDescription: compound.summary,
    researchOverview: compound.researchNotes,
    proposedMechanism: compound.proposedMechanism,
    researchCategories: mapCategories(compound),
    humanEvidenceGrade: compound.humanEvidenceGrade as EvidenceGrade,
    preclinicalEvidenceGrade: compound.preclinicalEvidenceGrade as EvidenceGrade,
    regulatoryStatus: compound.regulatoryStatus as RegulatoryStatus,
    regulatoryDetail: compound.regulatoryDetail,
    studiedRoutes: deriveStudiedRoutes(compound),
    studyDurationNotes:
      compound.humanEvidenceGrade === 'strong_human' || compound.humanEvidenceGrade === 'moderate_human'
        ? 'Pivotal programs often span months to one or more years where applicable.'
        : 'Most available studies are short-duration or preclinical.',
    humanEvidenceSummary: deriveHumanEvidenceSummary(compound),
    animalEvidenceSummary: deriveAnimalEvidenceSummary(compound),
    invitroEvidenceSummary: deriveInvitroSummary(compound),
    knownAdverseEffects: compound.knownAdverseEffects,
    reportedAdverseEffects: compound.knownAdverseEffects,
    contraindicationCategories: deriveContraindications(compound),
    interactionCategories: deriveInteractions(compound),
    risks: compound.risks,
    uncertainties: compound.uncertainties,
    ongoingTrials: compound.researchAreas.filter((a) =>
      /trial|phase|investigational|development|research/i.test(a),
    ).length
      ? compound.researchAreas
      : compound.regulatoryStatus === 'investigational'
        ? ['Ongoing clinical development programs']
        : [],
    references: compound.references.map(toCitation),
    lastReviewedAt: compound.lastReviewedAt,
    reviewStatus: 'reviewed',
  };
}

/**
 * Library includes all peptides plus any non-peptide compounds sold by sponsors
 * (e.g. BAC water, NAD+). Chat recommendations stay peptide-only via
 * `getPeptideCompounds` / `filterPeptideIds`.
 */
const LIBRARY_COMPOUNDS = KNOWLEDGE_COMPOUNDS.filter(
  (compound) => compound.isPeptide || SPONSOR_COMPOUND_IDS.has(compound.id),
);

export const MOCK_PEPTIDES: Peptide[] = LIBRARY_COMPOUNDS.map(knowledgeToPeptide);

export function getPeptideById(id: string): Peptide | undefined {
  return MOCK_PEPTIDES.find((p) => p.id === id);
}

export { KNOWLEDGE_COMPOUNDS } from '@/src/data/knowledge/compounds';
