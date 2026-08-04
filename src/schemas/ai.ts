import { z } from 'zod';

export const evidenceCardSchema = z.object({
  peptideId: z.string(),
  name: z.string(),
  aliases: z.array(z.string()),
  researchCategory: z.string(),
  relevanceSummary: z.string(),
  proposedMechanism: z.string(),
  humanEvidenceGrade: z.enum([
    'strong_human',
    'moderate_human',
    'limited_human',
    'early_stage',
    'preclinical_only',
    'anecdotal',
    'insufficient',
  ]),
  preclinicalEvidenceGrade: z.enum([
    'strong_human',
    'moderate_human',
    'limited_human',
    'early_stage',
    'preclinical_only',
    'anecdotal',
    'insufficient',
  ]),
  regulatoryStatus: z.enum([
    'fda_approved_specific',
    'approved_outside_us',
    'investigational',
    'compounded_limited',
    'not_fda_approved',
    'research_stage',
    'withdrawn',
    'unknown',
  ]),
  regulatoryDetail: z.string().optional(),
  knownRisks: z.array(z.string()),
  uncertainties: z.array(z.string()),
  citationCount: z.number().int().nonnegative(),
  lastReviewedAt: z.string(),
});

export const citationSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.string(),
  year: z.number().int(),
  journal: z.string().optional(),
  url: z.string().url().optional(),
  evidenceType: z.enum(['human', 'animal', 'in_vitro', 'review', 'other']),
});

export const messageClassificationSchema = z.enum([
  'general_peptide_education',
  'research_goal_exploration',
  'compound_comparison',
  'evidence_review',
  'regulatory_status_question',
  'personalized_medical_request',
  'personalized_dosing_request',
  'cycle_or_stack_construction',
  'reconstitution_instructions',
  'injection_instructions',
  'vendor_or_sourcing_request',
  'evade_medical_supervision',
  'acute_adverse_event',
  'minor_user',
  'prompt_injection',
  'spam',
  'automated_scraping',
  'repeated_policy_circumvention',
]);

export const pepGuideResponseSchema = z.object({
  answer: z.string().min(1),
  classification: messageClassificationSchema,
  safetyAction: z.enum(['allow', 'refuse', 'urgent_warning', 'rate_limit']),
  evidenceCards: z.array(evidenceCardSchema),
  citations: z.array(citationSchema),
  suggestedQuestions: z.array(z.string()),
  peptideIds: z.array(z.string()),
});


export const sendMessageRequestSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().min(1).max(4000),
  researchMode: z.enum([
    'quick_overview',
    'evidence_review',
    'compound_comparison',
    'deep_research',
    'build_report',
  ]),
  evidenceDepth: z.enum(['simple', 'detailed', 'technical']),
  temporary: z.boolean().default(false),
});

export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;
