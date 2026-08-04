import type { MessageClassification, SafetyAction } from '@/src/types';

export type ClassificationResult = {
  category: MessageClassification;
  safetyAction: SafetyAction;
  /** Query rewritten for knowledge retrieval when personalized phrasing is present. */
  retrievalQuery: string;
};

const URGENT = [
  /chest pain/i,
  /can'?t breathe|difficulty breathing|shortness of breath/i,
  /faint(ing|ed)?/i,
  /seizure/i,
  /allergic reaction|anaphylaxis/i,
  /suicidal|kill myself/i,
  /overdose/i,
  /sudden weakness/i,
  /severe abdominal pain/i,
];

function stripPersonalizedFraming(content: string): string {
  return content
    .replace(/what should i (take|use|try)/gi, 'research compounds for')
    .replace(/what can i take/gi, 'research compounds for')
    .replace(/prescribe( me)?/gi, '')
    .replace(/diagnose me/gi, '')
    .replace(/\bfor me\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function classifyMessage(content: string): ClassificationResult {
  const retrievalQuery = stripPersonalizedFraming(content) || content;

  if (URGENT.some((pattern) => pattern.test(content))) {
    return {
      category: 'acute_adverse_event',
      safetyAction: 'urgent_warning',
      retrievalQuery,
    };
  }
  if (/ignore previous|system prompt|jailbreak/i.test(content)) {
    return { category: 'prompt_injection', safetyAction: 'refuse', retrievalQuery };
  }
  if (/i am (12|13|14|15|16|17)\b|under 18|i'?m a minor/i.test(content)) {
    return { category: 'minor_user', safetyAction: 'refuse', retrievalQuery };
  }
  if (/reconstitut|bacteriostatic water|bac water/i.test(content)) {
    return {
      category: 'reconstitution_instructions',
      safetyAction: 'refuse',
      retrievalQuery,
    };
  }
  if (/\b(inject|syringe|subq|intramuscular)\b/i.test(content)) {
    return {
      category: 'injection_instructions',
      safetyAction: 'refuse',
      retrievalQuery,
    };
  }
  if (/where (can|do) i buy|vendor|source peptide|purchase link/i.test(content)) {
    return {
      category: 'vendor_or_sourcing_request',
      safetyAction: 'refuse',
      retrievalQuery,
    };
  }
  // Allow educational research/label dosing ranges. Refuse only clear personal titration asks.
  if (
    /\b(dose me|dosing for me|how much should i take|what dose should i|titrate me)\b/i.test(
      content,
    )
  ) {
    return {
      category: 'personalized_dosing_request',
      safetyAction: 'refuse',
      retrievalQuery,
    };
  }
  // Refuse personal cycle/stack builds, but allow educational add-on / complementary research.
  if (/cycle for me|stack for me|protocol for me/i.test(content)) {
    const educationalCombo =
      /\b(appetite|hunger|hungry|satiety|craving|complement|add[- ]?on|alongside|combine|combination|pair(?:ed|ing)?)\b/i.test(
        content,
      );
    if (!educationalCombo) {
      return {
        category: 'cycle_or_stack_construction',
        safetyAction: 'refuse',
        retrievalQuery,
      };
    }
  }
  if (/don'?t tell (my )?doctor|hide from|evade/i.test(content)) {
    return {
      category: 'evade_medical_supervision',
      safetyAction: 'refuse',
      retrievalQuery,
    };
  }

  // Personalized phrasing with a clear research topic → educational allow.
  if (/what should i take|diagnose me|prescribe/i.test(content)) {
    return {
      category: 'research_goal_exploration',
      safetyAction: 'allow',
      retrievalQuery,
    };
  }
  if (/compare/i.test(content)) {
    return {
      category: 'compound_comparison',
      safetyAction: 'allow',
      retrievalQuery,
    };
  }
  if (/evidence|trial|study/i.test(content)) {
    return { category: 'evidence_review', safetyAction: 'allow', retrievalQuery };
  }
  if (/fda|regulatory|approved/i.test(content)) {
    return {
      category: 'regulatory_status_question',
      safetyAction: 'allow',
      retrievalQuery,
    };
  }

  return {
    category: 'research_goal_exploration',
    safetyAction: 'allow',
    retrievalQuery,
  };
}
