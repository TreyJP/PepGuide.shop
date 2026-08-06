import { KNOWLEDGE_COMPOUNDS } from '@/src/data/knowledge';
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

/** Research goals + PepGuide vocabulary that keep a message in scope. */
const IN_SCOPE_HINT =
  /\b(peptide|peptides|compound|compounds|research|clinical|trial|trials|evidence|mechanism|receptor|agonist|antagonist|glp-?1|gip|glucagon|retatrutide|tirzepatide|semaglutide|bpc-?157|tb-?500|cjc|ipamorelin|sermorelin|mk-?677|ghk|melanotan|pt-?141|kisspeptin|gonadorelin|hcg|hmg|aod|mots-?c|ss-?31|epithalon|epitalon|thymosin|metabolic|obesity|weight\s*loss|fat\s*loss|lean\s*mass|body\s*recomp|recomp|muscle|hypertrophy|recovery|healing|injury|inflammation|joint|tendon|ligament|gut|insulin|diabetes|cortisol|testosterone|fertility|hypogonadism|sleep|cognitive|longevity|aging|dosing|dose|mcg|mg|iu|fda|investigational|preclinical|incretin|secretagogue|ampk|mtor|collagen|wound|scar|satiety|appetite|libido|erectile|hair|skin|tan(?:ning)?|cycle|stack|library|calculator|pepguide|nafld|masld|sarcopenia|neuropeptide|gh\b|growth hormone)\b/i;

/** Greetings, fillers, and nonsense that aren't research questions. */
const IRRELEVANT_FILLER =
  /^(hi|hello|hey|yo|sup|test(ing)?|asdf+|qwerty|ok(ay)?|k|yes|no|thanks|thank you|thx|cool|lol|lmao|hmm+|huh+|what|who are you|help|ping|foo|bar|abc|123+|n\/?a)[.!?]*$/i;

const OUT_OF_SCOPE_PATTERNS = [
  /\b(write|generate|create)\b.{0,40}\b(poem|essay|story|song|lyrics|joke|screenplay|homework|resume|cover letter)\b/i,
  /\b(python|javascript|typescript|java|c\+\+|golang|ruby|php|sql)\b.{0,40}\b(code|script|function|program|bug|debug)\b/i,
  /\b(code|script|function|program)\b.{0,40}\b(python|javascript|typescript|java|c\+\+)\b/i,
  /\b(who won|sports score|nba|nfl|mlb|soccer match|football game)\b/i,
  /\b(stock price|buy bitcoin|crypto trading|forex|lottery numbers)\b/i,
  /\b(recipe for|cook(?:ing)? dinner|meal plan for tonight)\b/i,
  /\b(translate (this|to)|as a pirate|roleplay as|pretend you are (?!.*peptide))\b/i,
  /\b(weather (today|tomorrow)|what'?s the weather)\b/i,
  /\b(dating advice|horoscope|astrology reading)\b/i,
  /\b(how (do|can) i (hack|phish|ddos)|make a bomb|illegal (drugs|weapons))\b/i,
  /\b(capital of|who is the president|movie recommendations?|netflix|celebrity gossip)\b/i,
  /\b(do my homework|write my essay|solve this math)\b/i,
];

let knownCompoundPattern: RegExp | null = null;

function getKnownCompoundPattern(): RegExp {
  if (knownCompoundPattern) return knownCompoundPattern;

  const terms = new Set<string>();
  for (const compound of KNOWLEDGE_COMPOUNDS) {
    terms.add(compound.id);
    terms.add(compound.name);
    for (const alias of compound.aliases) {
      if (alias.trim().length >= 3) terms.add(alias.trim());
    }
  }

  const escaped = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  knownCompoundPattern = new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'i');
  return knownCompoundPattern;
}

export function mentionsKnownCompound(content: string): boolean {
  return getKnownCompoundPattern().test(content);
}

export function hasInScopeSignal(content: string): boolean {
  return IN_SCOPE_HINT.test(content) || mentionsKnownCompound(content);
}

/** Clear spam / nonsensical abuse of the chat. */
export function isSpamMessage(content: string): boolean {
  const text = content.trim();
  if (!text) return false;
  if (/(.)\1{12,}/i.test(text)) return true;
  if (/^(.{1,4})\1{8,}$/i.test(text.replace(/\s+/g, ''))) return true;
  const words = text.split(/\s+/);
  if (words.length >= 8 && new Set(words.map((w) => w.toLowerCase())).size <= 2) {
    return true;
  }
  const alpha = text.replace(/[^a-z]/gi, '');
  if (alpha.length >= 20 && !/[aeiou]/i.test(alpha)) return true;
  return false;
}

/**
 * Messages with no peptide/research signal — "test", sports, coding, etc.
 * Default deny unless a clear PepGuide research signal is present.
 */
export function isIrrelevantToPeptides(content: string): boolean {
  const text = content.trim();
  if (!text) return true;
  if (hasInScopeSignal(text)) return false;
  if (IRRELEVANT_FILLER.test(text)) return true;

  // No PepGuide research vocabulary and no known compound → out of scope.
  return true;
}

/** Off-topic asks that are not peptide / PepGuide research. */
export function isOutOfScopeMessage(content: string): boolean {
  const text = content.trim();
  if (!text) return false;

  if (OUT_OF_SCOPE_PATTERNS.some((pattern) => pattern.test(text))) {
    // Still allow if clearly about peptides (e.g. "write a summary of retatrutide research").
    if (hasInScopeSignal(text) && !/\b(poem|song|lyrics|joke|hack|bomb)\b/i.test(text)) {
      return false;
    }
    return true;
  }

  if (isIrrelevantToPeptides(text)) return true;

  // General-assistant pivots even if they sneak a research word somehow.
  if (
    /\b(chat with me|be my (friend|girlfriend|boyfriend)|tell me a joke|what can you do for fun)\b/i.test(
      text,
    )
  ) {
    return true;
  }

  return false;
}

/** Any Guides / Protocols talk → PepGuide Pro unlock path. */
export function isProContentInquiry(content: string): boolean {
  const text = content.trim();
  if (!text) return false;

  if (
    /\b(pep\s*-?\s*guide\s*pro|pepguide\s*pro|pro\s+(section|area|tab|content|library)|video\s+lessons?|skool)\b/i.test(
      text,
    )
  ) {
    return true;
  }

  if (/\bprotocols?\b/i.test(text)) {
    return true;
  }

  const withoutCasualGuide = text
    .replace(/\bguide me\b/gi, ' ')
    .replace(/\bguidance\b/gi, ' ');
  if (/\bguides?\b/i.test(withoutCasualGuide)) {
    return true;
  }

  return false;
}

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
  if (isSpamMessage(content)) {
    return { category: 'spam', safetyAction: 'refuse', retrievalQuery };
  }
  if (isOutOfScopeMessage(content)) {
    return { category: 'out_of_scope', safetyAction: 'refuse', retrievalQuery };
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
  if (isProContentInquiry(content)) {
    return {
      category: 'pro_content_inquiry',
      safetyAction: 'allow',
      retrievalQuery,
    };
  }

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
  if (/cycle for me|stack for me/i.test(content)) {
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
