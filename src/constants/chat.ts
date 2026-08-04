export const SUGGESTED_PROMPTS = [
  'Which peptides are researched for metabolic health?',
  'Compare BPC-157 and TB-500 research.',
  'Explain GLP-1, GIP, and glucagon receptor activity.',
  'Which peptides have the strongest human evidence?',
  'Summarize current retatrutide research.',
  'Help me create a peptide research report.',
] as const;

export const MESSAGE_LIMITS = {
  maxInputChars: 4000,
  maxConversationMessages: 200,
  perMinute: 6,
  perHour: 60,
} as const;

/** Marker answer — UI renders Top 3 picks instead of markdown. */
export const PICKS_ONLY_ANSWER = '[[picks]]';
