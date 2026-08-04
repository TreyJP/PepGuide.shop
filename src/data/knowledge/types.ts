export type KnowledgeCategory =
  | 'metabolic_weight'
  | 'healing_recovery'
  | 'cosmetic_skin'
  | 'sexual_health'
  | 'hair_research'
  | 'gh_secretagogues'
  | 'sleep_circadian'
  | 'cognitive_neuropeptide'
  | 'general';

export type EvidenceGrade =
  | 'strong_human'
  | 'moderate_human'
  | 'limited_human'
  | 'early_stage'
  | 'preclinical_only'
  | 'anecdotal'
  | 'insufficient';

export type RegulatoryStatus =
  | 'fda_approved_specific'
  | 'approved_outside_us'
  | 'investigational'
  | 'compounded_limited'
  | 'not_fda_approved'
  | 'research_stage'
  | 'withdrawn'
  | 'unknown';

export type KnowledgeReference = {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal?: string;
  evidenceType: 'human' | 'animal' | 'in_vitro' | 'review' | 'other';
};

export type KnowledgeCompound = {
  id: string;
  name: string;
  aliases: string[];
  isPeptide: boolean;
  classification: string;
  categories: KnowledgeCategory[];
  summary: string;
  proposedMechanism: string;
  researchNotes: string;
  humanEvidenceGrade: EvidenceGrade;
  preclinicalEvidenceGrade: EvidenceGrade;
  regulatoryStatus: RegulatoryStatus;
  regulatoryDetail?: string;
  researchAreas: string[];
  risks: string[];
  uncertainties: string[];
  knownAdverseEffects: string[];
  references: KnowledgeReference[];
  lastReviewedAt: string;
};
