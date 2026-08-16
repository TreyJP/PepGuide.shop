import OpenAI from 'openai';

import { PEP_GUIDE_MODEL } from '@/src/constants/ai';

export const RESEARCH_GOALS = [
  'muscle',
  'weight_loss',
  'dual_weight_muscle',
  'appetite_complement',
  'recovery',
  'sleep',
  'cognitive',
  'skin_hair',
  'sexual',
  'longevity',
  'general',
  'off_topic',
] as const;

export type ResearchGoal = (typeof RESEARCH_GOALS)[number];

export type ResearchIntent = {
  goal: ResearchGoal;
  /** Normalized PepGuide keywords for matching / grounding. */
  keywords: string[];
  /** One-line plain-English summary of what the user wants. */
  summary: string;
  /** Search-friendly query for knowledge retrieval. */
  retrievalQuery: string;
};

export type IntentSummarizeResult = {
  intent: ResearchIntent;
  usage?: { inputTokens: number; outputTokens: number };
};

const INTENT_SYSTEM = `You normalize PepGuide chat questions into a research goal.

PepGuide is peptide research education only (not medical advice).

Return ONLY JSON:
{
  "goal": one of ${RESEARCH_GOALS.map((g) => `"${g}"`).join(' | ')},
  "keywords": string[] (3-8 PepGuide-style keywords),
  "summary": string (max 20 words),
  "retrievalQuery": string (search query for peptide knowledge)
}

Goal rules:
- muscle: add size, bulk, gains, hypertrophy, lean mass, GH secretagogues, get bigger, put on mass
- weight_loss: lose fat/weight, obesity, GLP-1/incretin metabolic fat loss
- dual_weight_muscle: BOTH fat loss AND muscle/size in one ask, or recomp
- appetite_complement: already tried an incretin (reta/tirz/sema etc.) and still hungry / need an add-on ON TOP — not another GLP-1 restart
- recovery: injury, healing, joints, BPC/TB-style recovery
- sleep: sleep, circadian
- cognitive: focus, memory, nootropics-as-peptides
- skin_hair: skin, hair, cosmetic peptides, tanning / getting a tan / darker skin / sunless tan / pigmentation (melanotan)
- sexual: libido, sexual health peptides
- longevity: aging, longevity peptides
- general: peptide research that does not fit above
- off_topic: clearly unrelated (sports scores, coding homework, poems)

Map slang to goals (e.g. "add size" → muscle; "get shredded" → weight_loss; "reta" → retatrutide; "bpc" → BPC-157; "ipa" → ipamorelin; "get tan" / "tanning" / "darker skin" → skin_hair via melanotan).
If the user says they took/tried ANY peptide and it was not enough / still has the problem → keep the same research lane but recommend a NEXT or ADD-ON option. NEVER restart with the same compound as the answer.
Examples: still hungry on reta → amylin add-on; tried BPC and still sore → TB-500 / related recovery peers; tried ipamorelin with weak results → CJC / sermorelin peers.
Never invent personal dosing protocols.`;

function isResearchGoal(value: unknown): value is ResearchGoal {
  return (
    typeof value === 'string' &&
    (RESEARCH_GOALS as readonly string[]).includes(value)
  );
}

function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function heuristicIntent(userMessage: string): ResearchIntent {
  const text = userMessage.trim();
  const lower = text.toLowerCase();

  if (
    /\b(write|generate|create)\b.{0,40}\b(poem|essay|story|song|lyrics|joke|homework)\b/i.test(
      text,
    ) ||
    /\b(python|javascript|typescript)\b.{0,40}\b(code|script|function)\b/i.test(
      text,
    ) ||
    /\b(nba|nfl|stock price|weather today|netflix)\b/i.test(text)
  ) {
    return {
      goal: 'off_topic',
      keywords: [],
      summary: 'Off-topic request outside peptide research.',
      retrievalQuery: text,
    };
  }

  const muscle =
    /\b(muscle|hypertrophy|anabolic|lean\s*mass|build\s+muscle|gain(?:ing)?\s+muscle|gains?|add\s+size|gain\s+size|put\s+on\s+size|bulk(?:ing)?|pack\s+on|get\s+bigger|mass\s+gain|get\s+stronger|weight\s*train(?:ing)?|gain\s+weight|secretagogue|ipamorelin|cjc|sermorelin)\b/i.test(
      text,
    );
  const weight =
    /\b(lose\s+weight|weight\s*loss|losing\s+weight|fat\s*loss|lose\s+fat|obesity|obese|overweight|glp-?1|retatrutide|\breta\b|semaglutide|\bsema\b|tirzepatide|\btirz\b|slim\s+down|burn\s+fat|cut\s+fat|get\s+shredded)\b/i.test(
      text,
    );
  const appetite =
    /\b(appetite|hunger|hungry|satiety|craving|still hungry|left me hungry)\b/i.test(
      text,
    );
  const namedIncretin =
    /\b(retatrutide|\breta\b|tirzepatide|\btirz\b|semaglutide|\bsema\b|ozempic|wegovy|mounjaro|zepbound)\b/i.test(
      text,
    );
  const triedNotEnough =
    /\b(took|taking|tried|been on|i'?m on|was on|using|used|not enough|wasn'?t enough|didn'?t (work|help)|still|on top|add[- ]?on|alongside)\b/i.test(
      text,
    );
  const recomp = /\b(recomp|recompos(?:e|ition)|body\s*recomp)\b/i.test(text);

  if (recomp || (muscle && weight)) {
    return {
      goal: 'dual_weight_muscle',
      keywords: ['weight loss', 'muscle', 'lean mass', 'recomp'],
      summary: 'User wants both fat loss and muscle / size research.',
      retrievalQuery:
        'weight loss muscle lean mass retatrutide ipamorelin cjc-1295',
    };
  }
  // Tried an incretin / still hungry → add-on path (not another GLP-1 restart).
  if (appetite && (namedIncretin || (weight && triedNotEnough))) {
    return {
      goal: 'appetite_complement',
      keywords: ['appetite', 'satiety', 'cagrilintide', 'amylin', 'add-on'],
      summary:
        'User already tried a metabolic option and needs an appetite add-on path.',
      retrievalQuery: 'appetite satiety cagrilintide amylin complement add-on',
    };
  }
  if (muscle) {
    return {
      goal: 'muscle',
      keywords: ['muscle', 'hypertrophy', 'lean mass', 'secretagogue', 'size'],
      summary: 'User wants muscle / size building peptide research.',
      retrievalQuery:
        'muscle hypertrophy lean mass growth hormone secretagogue ipamorelin cjc-1295 sermorelin',
    };
  }
  if (weight) {
    return {
      goal: 'weight_loss',
      keywords: ['weight loss', 'fat loss', 'metabolic', 'GLP-1'],
      summary: 'User wants weight-loss / metabolic peptide research.',
      retrievalQuery:
        'weight loss obesity GLP-1 retatrutide tirzepatide semaglutide',
    };
  }
  if (/\b(heal|recovery|injury|joint|tendon|bpc|tb-?500)\b/i.test(lower)) {
    return {
      goal: 'recovery',
      keywords: ['recovery', 'healing', 'injury'],
      summary: 'User wants recovery / healing peptide research.',
      retrievalQuery: 'recovery healing injury BPC-157 TB-500',
    };
  }
  if (/\b(sleep|insomnia|circadian)\b/i.test(lower)) {
    return {
      goal: 'sleep',
      keywords: ['sleep', 'circadian'],
      summary: 'User wants sleep-related peptide research.',
      retrievalQuery: 'sleep circadian peptide research',
    };
  }
  if (
    /\b(tan|tanning|tanned|sunless\s+tan|darker\s+skin|melanotan|mt-?1|mt-?2|skin|hair|cosmetic|wrinkle|pigment(?:ation)?)\b/i.test(
      lower,
    )
  ) {
    return {
      goal: 'skin_hair',
      keywords: ['skin', 'hair', 'tanning', 'melanotan', 'cosmetic'],
      summary: 'User wants skin / hair / tanning peptide research.',
      retrievalQuery: 'melanotan tanning skin hair cosmetic peptide research',
    };
  }

  return {
    goal: 'general',
    keywords: ['peptide', 'research'],
    summary: text.slice(0, 120),
    retrievalQuery: text,
  };
}

/**
 * Cheap LLM pass that turns slang / natural language into a PepGuide research goal.
 * Falls back to heuristics when OpenAI is unavailable or parsing fails.
 */
export async function summarizeResearchIntent(
  userMessage: string,
): Promise<IntentSummarizeResult> {
  const fallback = heuristicIntent(userMessage);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { intent: fallback };
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: PEP_GUIDE_MODEL,
      temperature: 0,
      max_tokens: 180,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: INTENT_SYSTEM },
        { role: 'user', content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const usage =
      typeof completion.usage?.prompt_tokens === 'number' ||
      typeof completion.usage?.completion_tokens === 'number'
        ? {
            inputTokens: completion.usage?.prompt_tokens ?? 0,
            outputTokens: completion.usage?.completion_tokens ?? 0,
          }
        : {
            inputTokens: estimateTokens(`${INTENT_SYSTEM}${userMessage}`),
            outputTokens: estimateTokens(content ?? ''),
          };

    if (!content) {
      return { intent: fallback, usage };
    }

    const parsed = JSON.parse(content) as {
      goal?: unknown;
      keywords?: unknown;
      summary?: unknown;
      retrievalQuery?: unknown;
    };

    const goal = isResearchGoal(parsed.goal) ? parsed.goal : fallback.goal;
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 10)
      : fallback.keywords;
    const summary =
      typeof parsed.summary === 'string' && parsed.summary.trim()
        ? parsed.summary.trim().slice(0, 160)
        : fallback.summary;
    const retrievalQuery =
      typeof parsed.retrievalQuery === 'string' && parsed.retrievalQuery.trim()
        ? parsed.retrievalQuery.trim().slice(0, 240)
        : fallback.retrievalQuery;

    return {
      intent: {
        goal,
        keywords: keywords.length > 0 ? keywords : fallback.keywords,
        summary,
        retrievalQuery,
      },
      usage,
    };
  } catch (error) {
    console.error('Research intent summarize failed; using heuristics', error);
    return { intent: fallback };
  }
}
