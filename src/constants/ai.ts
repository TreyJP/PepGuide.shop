/** Single model used for every PepGuide AI request. */
export const PEP_GUIDE_MODEL = 'gpt-4.1-mini' as const;

/** Fixed research approach — no per-request model or mode switching. */
export const DEFAULT_RESEARCH_MODE = 'quick_overview' as const;
export const DEFAULT_EVIDENCE_DEPTH = 'detailed' as const;
