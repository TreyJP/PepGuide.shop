import type {
  ExperienceLevel,
  ResearchInterest,
  ResearchPreference,
} from '@/src/types';

export const RESEARCH_INTERESTS: {
  id: ResearchInterest;
  label: string;
}[] = [
  { id: 'body_composition', label: 'Body composition' },
  { id: 'metabolic', label: 'Metabolic research' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'cognitive', label: 'Cognitive performance' },
  { id: 'healthy_aging', label: 'Healthy-aging research' },
  { id: 'skin_hair', label: 'Skin and hair research' },
  { id: 'injury', label: 'Injury-related research' },
  { id: 'general_education', label: 'General peptide education' },
  { id: 'other', label: 'Other' },
];

export const EXPERIENCE_LEVELS: {
  id: ExperienceLevel;
  label: string;
  description: string;
}[] = [
  {
    id: 'completely_new',
    label: 'Completely new',
    description: 'Prefer plain-language explanations with clear definitions.',
  },
  {
    id: 'basic',
    label: 'Some basic knowledge',
    description: 'Comfortable with common terms, still prefer guided summaries.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'Want balanced detail across mechanisms and evidence quality.',
  },
  {
    id: 'advanced',
    label: 'Advanced researcher',
    description: 'Prefer technical language, study design notes, and caveats.',
  },
];

export const RESEARCH_PREFERENCES: {
  id: ResearchPreference;
  label: string;
}[] = [
  { id: 'prefer_human_clinical', label: 'Prefer human clinical evidence' },
  { id: 'include_early_stage', label: 'Include early-stage research' },
  { id: 'include_animal', label: 'Include animal research' },
  { id: 'highly_studied_only', label: 'Show only highly studied compounds' },
  { id: 'always_regulatory', label: 'Always display regulatory status' },
  { id: 'always_safety', label: 'Always display major safety concerns' },
  { id: 'prefer_simple', label: 'Prefer simple explanations' },
  { id: 'prefer_technical', label: 'Prefer technical explanations' },
];
