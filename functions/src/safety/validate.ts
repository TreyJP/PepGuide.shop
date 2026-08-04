type ValidationResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; reasons: string[] };

const UNSAFE = [
  /you should take/i,
  /the best peptide for you/i,
  /use this dose/i,
  /run this cycle/i,
  /\b\d+\s?mg\b.*daily/i,
  /reconstitut/i,
  /inject into/i,
  /buy from|purchase at|vendor/i,
  /guaranteed safe/i,
  /proven safe for you/i,
];

export function validateAiOutput(output: unknown): ValidationResult {
  if (!output || typeof output !== 'object') {
    return { ok: false, reasons: ['invalid_shape'] };
  }

  const value = output as Record<string, unknown>;
  const answer = typeof value.answer === 'string' ? value.answer : '';
  if (!answer) {
    return { ok: false, reasons: ['missing_answer'] };
  }

  const reasons = UNSAFE.filter((pattern) => pattern.test(answer)).map((pattern) =>
    pattern.source,
  );

  if (reasons.length > 0) {
    return { ok: false, reasons };
  }

  return {
    ok: true,
    value: {
      answer,
      classification:
        typeof value.classification === 'string'
          ? value.classification
          : 'general_peptide_education',
      safetyAction:
        value.safetyAction === 'refuse' ||
        value.safetyAction === 'urgent_warning' ||
        value.safetyAction === 'rate_limit'
          ? value.safetyAction
          : 'allow',
      evidenceCards: Array.isArray(value.evidenceCards) ? value.evidenceCards : [],
      citations: Array.isArray(value.citations) ? value.citations : [],
      suggestedQuestions: Array.isArray(value.suggestedQuestions)
        ? value.suggestedQuestions
        : [],
      peptideIds: Array.isArray(value.peptideIds) ? value.peptideIds : [],
    },
  };
}
