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

/**
 * When a thread gets this large, start a fresh chat automatically
 * so prompts stay within a usable context window.
 */
export const CHAT_CONTEXT_LIMITS = {
  /** Total stored messages (user + assistant) before auto-rotate. */
  maxMessages: 20,
  /** Rough token estimate (chars/4) across the thread before auto-rotate. */
  maxEstimatedTokens: 14_000,
  /** How many prior turns to carry into the new chat’s API history. */
  carryHistoryTurns: 4,
} as const;

/** Marker answer — UI renders Top 3 picks instead of markdown. */
export const PICKS_ONLY_ANSWER = '[[picks]]';

/** Marker answer — UI renders PepGuide Pro unlock CTA in chat. */
export const PRO_UNLOCK_ANSWER = '[[pro-unlock]]';
