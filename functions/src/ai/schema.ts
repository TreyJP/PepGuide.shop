import { z } from 'zod';

export const sendMessageSchema = z.object({
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

export const pepGuideResponseSchema = z.object({
  answer: z.string().min(1),
  classification: z.string(),
  safetyAction: z.enum(['allow', 'refuse', 'urgent_warning', 'rate_limit']),
  evidenceCards: z.array(z.record(z.unknown())),
  citations: z.array(z.record(z.unknown())),
  suggestedQuestions: z.array(z.string()),
  peptideIds: z.array(z.string()),
});
