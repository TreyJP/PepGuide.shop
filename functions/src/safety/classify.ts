export type ClassificationResult = {
  category:
    | 'general_peptide_education'
    | 'research_goal_exploration'
    | 'compound_comparison'
    | 'evidence_review'
    | 'regulatory_status_question'
    | 'personalized_medical_request'
    | 'personalized_dosing_request'
    | 'cycle_or_stack_construction'
    | 'reconstitution_instructions'
    | 'injection_instructions'
    | 'vendor_or_sourcing_request'
    | 'evade_medical_supervision'
    | 'acute_adverse_event'
    | 'minor_user'
    | 'prompt_injection'
    | 'spam'
    | 'automated_scraping'
    | 'repeated_policy_circumvention';
  safetyAction: 'allow' | 'refuse' | 'urgent_warning';
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

export function classifyMessage(content: string): ClassificationResult {
  if (URGENT.some((pattern) => pattern.test(content))) {
    return { category: 'acute_adverse_event', safetyAction: 'urgent_warning' };
  }
  if (/ignore previous|system prompt|jailbreak/i.test(content)) {
    return { category: 'prompt_injection', safetyAction: 'refuse' };
  }
  if (/i am (12|13|14|15|16|17)\b|under 18|i'm a minor/i.test(content)) {
    return { category: 'minor_user', safetyAction: 'refuse' };
  }
  if (/reconstitut|bacteriostatic water|bac water/i.test(content)) {
    return { category: 'reconstitution_instructions', safetyAction: 'refuse' };
  }
  if (/inject|syringe|subq|intramuscular/i.test(content)) {
    return { category: 'injection_instructions', safetyAction: 'refuse' };
  }
  if (/where (can|do) i buy|vendor|source peptide|purchase link/i.test(content)) {
    return { category: 'vendor_or_sourcing_request', safetyAction: 'refuse' };
  }
  if (/dose|dosing|mg per|iu\b|units per day/i.test(content)) {
    return { category: 'personalized_dosing_request', safetyAction: 'refuse' };
  }
  if (/cycle|stack for me|protocol for me/i.test(content)) {
    return { category: 'cycle_or_stack_construction', safetyAction: 'refuse' };
  }
  if (/don'?t tell (my )?doctor|hide from|evade/i.test(content)) {
    return { category: 'evade_medical_supervision', safetyAction: 'refuse' };
  }
  if (/what should i take|diagnose me|prescribe/i.test(content)) {
    return { category: 'personalized_medical_request', safetyAction: 'refuse' };
  }
  if (/compare/i.test(content)) {
    return { category: 'compound_comparison', safetyAction: 'allow' };
  }
  if (/evidence|trial|study/i.test(content)) {
    return { category: 'evidence_review', safetyAction: 'allow' };
  }
  if (/fda|regulatory|approved/i.test(content)) {
    return { category: 'regulatory_status_question', safetyAction: 'allow' };
  }
  return { category: 'research_goal_exploration', safetyAction: 'allow' };
}
