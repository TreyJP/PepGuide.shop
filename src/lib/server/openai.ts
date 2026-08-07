import OpenAI from 'openai';

import { PEP_GUIDE_MODEL } from '@/src/constants/ai';
import {
  buildKnowledgeContext,
  filterPeptideIds,
  getCompoundById,
  searchKnowledge,
} from '@/src/data/knowledge';
import { PICKS_ONLY_ANSWER, PRO_UNLOCK_ANSWER } from '@/src/constants/chat';
import {
  findMentionedMetabolicIds,
  getAppetiteComplementIds,
  getWeightLossGuideIds,
  METABOLIC_TIER_GUIDE,
} from '@/src/data/knowledge/metabolic-guide';
import { getMuscleTopIds } from '@/src/data/knowledge/muscle-guide';
import { PEP_GUIDE_KNOWLEDGE_PREAMBLE } from '@/src/data/knowledge/system-context';
import {
  classifyMessage,
  isProContentInquiry,
} from '@/src/lib/server/classify';
import {
  summarizeResearchIntent,
  type ResearchIntent,
} from '@/src/lib/server/research-intent';
import { pepGuideResponseSchema } from '@/src/schemas/ai';
import type { PepGuideAiResponse } from '@/src/types';

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type ResearchGenerationResult = PepGuideAiResponse & {
  /** Server-only; strip before sending to the client. */
  usage?: TokenUsage;
};

function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function mergeUsage(
  a?: TokenUsage,
  b?: TokenUsage,
): TokenUsage | undefined {
  if (!a && !b) return undefined;
  return {
    inputTokens: (a?.inputTokens ?? 0) + (b?.inputTokens ?? 0),
    outputTokens: (a?.outputTokens ?? 0) + (b?.outputTokens ?? 0),
  };
}

function withUsage(
  response: PepGuideAiResponse,
  usage?: TokenUsage,
): ResearchGenerationResult {
  return usage ? { ...response, usage } : response;
}

function lastDiscoveryGuidanceContent(
  history: ResearchChatTurn[],
): string | null {
  const turn = [...history]
    .reverse()
    .find(
      (item) => item.role === 'assistant' && isDiscoveryGuidanceTurn(item.content),
    );
  return turn?.content ?? null;
}

/** Prefer LLM-normalized intent; fall back to keyword heuristics. */
function routeFromIntent(
  intent: ResearchIntent,
  userMessage: string,
  history: ResearchChatTurn[],
): PepGuideAiResponse | null {
  // Cap the quiz: guidance once, then deliver options (≤2–3 total replies).
  const deliverResult = shouldDeliverDiscoveryResult(history, userMessage);
  const priorGuidance = lastDiscoveryGuidanceContent(history);
  const priorWasMuscle =
    Boolean(priorGuidance) &&
    /\b(adding size|GH-related|lean mass|recovery between training)\b/i.test(
      priorGuidance!,
    );
  const priorWasWeight =
    Boolean(priorGuidance) &&
    /\b(fat loss|metabolism peptides|GLP-1)\b/i.test(priorGuidance!);

  switch (intent.goal) {
    case 'dual_weight_muscle':
      return buildDualGoalResponse();
    case 'muscle':
      return deliverResult
        ? buildMusclePicksResponse('research_goal_exploration', userMessage)
        : buildMuscleGuidanceResponse();
    case 'weight_loss':
      return deliverResult
        ? buildWeightLossPicksResponse(userMessage)
        : buildWeightLossGuidanceResponse();
    case 'appetite_complement':
      // Don't let a hunger chip restart a new lane mid fat-loss discovery.
      if (deliverResult && priorWasWeight) {
        return buildWeightLossPicksResponse(userMessage);
      }
      if (deliverResult && priorWasMuscle) {
        return buildMusclePicksResponse(
          'research_goal_exploration',
          userMessage,
        );
      }
      return buildAppetiteComplementResponse(userMessage, history);
    default:
      // Finish the open discovery arc even if intent drifts to "general".
      if (deliverResult && priorWasWeight) {
        return buildWeightLossPicksResponse(userMessage);
      }
      if (deliverResult && priorWasMuscle) {
        return buildMusclePicksResponse(
          'research_goal_exploration',
          userMessage,
        );
      }
      return null;
  }
}

export type ResearchChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

function getOpenAiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key ? key : null;
}

export function hasOpenAiKey(): boolean {
  return Boolean(getOpenAiKey());
}

const REFUSAL_ANSWERS: Partial<Record<string, string>> = {
  reconstitution_instructions:
    'I can’t help with reconstitution or preparation instructions. I can discuss research background, mechanisms, evidence quality, and research dosing ranges instead.',
  injection_instructions:
    'I can’t help with injection technique or administration how-tos. I can share research/label dosing ranges and compare compounds instead.',
  vendor_or_sourcing_request:
    'I can’t help with vendors, purchasing, or sourcing. I can discuss research compounds, evidence, and regulatory context instead.',
  personalized_dosing_request:
    'I can’t create a personal dose plan for you. I can share published trial or label research dosing ranges in a tier list instead.',
  cycle_or_stack_construction:
    'I can’t build personal cycles, stacks, or protocols. I can compare researched compounds at an educational level instead.',
  evade_medical_supervision:
    'I can’t help circumvent medical supervision. Please speak with a qualified clinician for personal medical decisions.',
  prompt_injection:
    'I can’t follow requests that try to override PepGuide’s research-only boundaries.',
  spam:
    'That doesn’t look like a peptide research question. Try asking about a compound, mechanism, evidence, or a research goal like weight loss, recovery, or sleep.',
  out_of_scope:
    'I’m focused on peptide research. Ask about a compound, mechanism, evidence, or a research goal (for example weight loss, muscle, recovery, or sleep).',
  minor_user:
    'PepGuide is only for adults. If you are under 18, please stop and talk with a parent/guardian and a clinician.',
  acute_adverse_event:
    'If you may be having a medical emergency, seek emergency care immediately or contact local emergency services. I can’t provide emergency medical treatment advice.',
  repeated_policy_circumvention:
    'Repeated requests outside PepGuide’s research boundaries aren’t allowed. Chat may be temporarily locked if this continues.',
};

function isWeightLossQuery(text: string): boolean {
  // Avoid bare "weight" alone — "weight training" / "add weight" are often muscle goals.
  if (
    /\b(weight\s*train(?:ing)?|train(?:ing)?\s+weight|add\s+weight|put\s+on\s+weight|gain\s+weight|weight\s+gain)\b/i.test(
      text,
    )
  ) {
    return false;
  }
  return /\b(lose\s+weight|weight\s*loss|losing\s+weight|fat\s*loss|lose\s+fat|obesity|obese|overweight|glp-?1|incretin|retatrutide|semaglutide|tirzepatide|slim\s+down|appetite|hunger|hungry|satiety|craving|burn\s+fat|cut\s+fat|belly\s*fat)\b/i.test(
    text,
  );
}

function isMuscleQuery(text: string): boolean {
  return /\b(muscle|hypertrophy|anabolic|lean\s*mass|build\s+muscle|gain(?:ing)?\s+muscle|muscle\s+gain|gains?|secretagogue|growth\s+hormone|\bgh\b|igf(?:-?1)?|ipamorelin|cjc|sermorelin|add\s+size|gain\s+size|put\s+on\s+size|pack\s+on\s+(?:size|mass|muscle)|get\s+bigger|bulk(?:ing)?|mass\s+gain|put\s+on\s+mass|add\s+mass|get\s+stronger|strength\s+gain|weight\s*train(?:ing)?|gain\s+weight|weight\s+gain|put\s+on\s+weight)\b/i.test(
    text,
  );
}

/** Discovery ask for muscle / size / GH-axis picks (not a deep dive). */
function shouldReturnMusclePicks(userMessage: string): boolean {
  if (!isMuscleQuery(userMessage)) return false;
  if (isDualWeightMuscleQuery(userMessage)) return false;
  if (isWeightLossQuery(userMessage)) return false;

  // Deep dives on a named muscle compound → full research answer.
  if (
    /\b(ipamorelin|cjc|sermorelin|igf|mgf|mk-?677)\b/i.test(userMessage) &&
    /\b(how|why|mechanism|evidence|risk|side effect|compare|vs\.?|versus|differ|trial|study)\b/i.test(
      userMessage,
    )
  ) {
    return false;
  }

  return true;
}

/** User asked for both fat-loss and muscle / lean-mass research in one message. */
function isDualWeightMuscleQuery(text: string): boolean {
  if (/\b(recomp|recompos(?:e|ition)|body\s*recomp)\b/i.test(text)) {
    return true;
  }
  return isWeightLossQuery(text) && isMuscleQuery(text);
}

function isAppetiteComplementQuery(text: string): boolean {
  return /\b(appetite|hunger|hungry|satiety|craving|still hungry|left me hungry)\b/i.test(
    text,
  );
}

/**
 * Weight/appetite follow-up on the CURRENT turn only.
 * Requires metabolic context so pivots like "build muscle instead" do not match.
 */
function isMetabolicFollowUp(text: string): boolean {
  if (isMuscleQuery(text) && !isAppetiteComplementQuery(text)) return false;

  const metabolicContext =
    isWeightLossQuery(text) || findMentionedMetabolicIds(text).length > 0;
  if (!metabolicContext) return false;

  return /\b(appetite|hunger|hungry|satiety|craving|still hungry|tried|add[- ]?on|alongside|on top|combine|combination|complement|pair(?:ed|ing)?(?:\s+with)?|not enough|didn'?t work|doesn'?t work|wasn'?t enough|left me|keep(?:s|ing)? me|residual)\b/i.test(
    text,
  );
}

/** User clearly switched research goals away from the prior weight-loss thread. */
function isTopicPivot(userMessage: string): boolean {
  // Combined goals stay on a dual answer — not a pure muscle pivot.
  if (isDualWeightMuscleQuery(userMessage)) return false;
  if (
    isMuscleQuery(userMessage) &&
    !isWeightLossQuery(userMessage) &&
    !isAppetiteComplementQuery(userMessage)
  ) {
    return true;
  }
  // New non-weight research goal while not continuing metabolic follow-up.
  if (
    !isWeightLossQuery(userMessage) &&
    !isMetabolicFollowUp(userMessage) &&
    /\b(heal(?:ing)?|recover(?:y)?|hair|sleep|skin|libido|cognitive|focus|tan(?:ning)?)\b/i.test(
      userMessage,
    )
  ) {
    return true;
  }
  return false;
}

/** Compact top-picks UI for weight/fat-loss discovery asks. */
function shouldReturnWeightLossPicks(
  userMessage: string,
  _history: ResearchChatTurn[] = [],
): boolean {
  if (!isWeightLossQuery(userMessage)) return false;
  // Dual goals get a split answer (one metabolic + one muscle), not weight-only picks.
  if (isDualWeightMuscleQuery(userMessage)) return false;
  // Appetite “still hungry / add-on” follow-ups get the complement path, not picks.
  if (isMetabolicFollowUp(userMessage)) return false;

  // Deep dives on a named metabolic compound → full research answer.
  const named = findMentionedMetabolicIds(userMessage);
  if (
    named.length > 0 &&
    /\b(how|why|mechanism|evidence|risk|side effect|compare|vs\.?|versus|differ|trial|study)\b/i.test(
      userMessage,
    )
  ) {
    return false;
  }

  // Any other weight/fat-loss ask → top 3 picks UI (even mid-chat).
  return true;
}

function normalizeHistory(
  history: ResearchChatTurn[] | undefined,
): ResearchChatTurn[] {
  if (!history?.length) return [];
  return history
    .filter(
      (turn) =>
        (turn.role === 'user' || turn.role === 'assistant') &&
        typeof turn.content === 'string' &&
        turn.content.trim().length > 0,
    )
    .slice(-12)
    .map((turn) => ({
      role: turn.role,
      content:
        turn.content === PICKS_ONLY_ANSWER
          ? '[Presented top research picks: retatrutide, tirzepatide, semaglutide with dosing guide.]'
          : turn.content.slice(0, 2000),
    }));
}

function buildGroundingQuery(
  userMessage: string,
  retrievalQuery: string,
  history: ResearchChatTurn[],
): string {
  const parts = [retrievalQuery, userMessage];
  const pivot = isTopicPivot(userMessage);

  if (isDualWeightMuscleQuery(userMessage)) {
    parts.push(
      'weight loss obesity GLP-1 retatrutide tirzepatide semaglutide',
      'muscle hypertrophy lean mass growth hormone secretagogue ipamorelin cjc-1295 sermorelin',
    );
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  if (isMuscleQuery(userMessage)) {
    parts.push(
      'muscle hypertrophy lean mass growth hormone secretagogue ipamorelin cjc-1295 sermorelin igf-1 peg-mgf',
    );
    // Do not pull prior weight-loss compounds into a muscle pivot.
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  if (isAppetiteComplementQuery(userMessage) || isMetabolicFollowUp(userMessage)) {
    parts.push(
      'cagrilintide amycretin amylin appetite satiety complementary combination',
    );
  }

  // Only reuse named compounds from history when still on the metabolic thread.
  if (!pivot && (isWeightLossQuery(userMessage) || isMetabolicFollowUp(userMessage))) {
    const historyText = history.map((turn) => turn.content).join(' ');
    const mentioned = findMentionedMetabolicIds(
      `${userMessage} ${retrievalQuery} ${historyText}`,
    );
    if (mentioned.length > 0) {
      parts.push(mentioned.join(' '));
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function buildSystemPrompt(
  userMessage: string,
  retrievalQuery: string,
  history: ResearchChatTurn[],
): string {
  // Intent is based on the CURRENT message — history must not force weight-loss mode.
  const dualQuery = isDualWeightMuscleQuery(userMessage);
  const weightQuery =
    isWeightLossQuery(userMessage) && !isMuscleQuery(userMessage);
  const muscleQuery =
    isMuscleQuery(userMessage) && !isWeightLossQuery(userMessage);
  const appetiteFollowUp =
    !dualQuery &&
    !muscleQuery &&
    (isAppetiteComplementQuery(userMessage) || isMetabolicFollowUp(userMessage));
  const topicPivot = isTopicPivot(userMessage);

  const groundingQuery = buildGroundingQuery(
    userMessage,
    retrievalQuery,
    history,
  );

  const knowledgeContext = dualQuery
    ? buildKnowledgeContext(
        'weight loss obesity GLP-1 retatrutide tirzepatide semaglutide muscle hypertrophy lean mass ipamorelin cjc-1295 sermorelin',
        8,
      )
    : appetiteFollowUp
      ? buildKnowledgeContext(
          'cagrilintide amycretin amylin appetite satiety complementary combination retatrutide tirzepatide semaglutide',
          8,
        )
      : muscleQuery
        ? buildKnowledgeContext(
            'muscle hypertrophy lean mass growth hormone secretagogue ipamorelin cjc-1295 sermorelin igf-1 peg-mgf',
            8,
          )
        : weightQuery && history.length === 0
          ? buildKnowledgeContext(
              'weight loss obesity GLP-1 retatrutide tirzepatide semaglutide',
              3,
            )
          : buildKnowledgeContext(groundingQuery, 8);

  const dosingEntries = dualQuery
    ? [
        ...METABOLIC_TIER_GUIDE.filter((entry) => entry.tier === 'S').slice(0, 1),
      ]
    : appetiteFollowUp
      ? METABOLIC_TIER_GUIDE.filter((entry) =>
          ['cagrilintide', 'amycretin', 'retatrutide'].includes(entry.id),
        )
      : weightQuery && !topicPivot
        ? METABOLIC_TIER_GUIDE.filter(
            (entry) => entry.tier === 'S' || entry.tier === 'A',
          ).slice(0, 8)
        : [];

  const dosingGuide = dosingEntries
    .map(
      (entry) =>
        `${entry.tier}-tier | ${entry.name} (${entry.id}): ${entry.researchDosing} — ${entry.why}`,
    )
    .join('\n');

  return [
    PEP_GUIDE_KNOWLEDGE_PREAMBLE,
    'Return ONLY valid JSON with this shape:',
    '{',
    '  "answer": string,',
    '  "classification": string,',
    '  "safetyAction": "allow" | "refuse" | "urgent_warning" | "rate_limit",',
    '  "evidenceCards": array,',
    '  "citations": array,',
    '  "suggestedQuestions": string[],',
    '  "peptideIds": string[]',
    '}',
    'VOICE (strict):',
    '- Sound like a sharp research buddy in chat — natural, direct, human.',
    '- Keep answers SHORT: ~40–90 words by default. Only go longer if the user asks for detail.',
    '- SURFACE LEVEL: explain like you’re talking to a smart friend, not a journal club.',
    '- No dense mechanisms, trial jargon, evidence-grade dumps, or long risk lists unless asked.',
    '- Lead with the takeaway in 1–2 sentences, then at most 2–3 short bullets.',
    '- No essay intros, no textbook tone, no stacking disclaimers.',
    '- Skip phrases like “Based on PepGuide’s research knowledge base” or “educational overview”.',
    '- One light research-only note at the end is enough (e.g. “Research framing only.”).',
    'FOLLOW-UP RULES (strict — no rabbit holes):',
    '- Discovery arc max: 1 clarifying reply, then options. Never quiz more than once on the same goal.',
    '- Reply #1 (broad ask): short overview + ONE clarifying question + suggestedQuestions chips.',
    '- Reply #2: deliver concrete peptide options (peptideIds) and STOP asking to narrow.',
    '- If options were already shown, answer the new question directly — do not restart the quiz.',
    '- Prefer results within 2 assistant replies (3 max).',
    'CONVERSATION RULES:',
    '- Prioritize the CURRENT user question over older turns.',
    '- If the user pivots to a new research goal (e.g. muscle after weight loss), answer that new goal.',
    '- Do NOT keep recommending weight-loss / GLP-1 compounds unless the user asks to combine goals.',
    '- Use prior turns only when the user is clearly continuing the same topic.',
    '- Stay educational — compare options, do not prescribe a personal protocol.',
    dualQuery
      ? [
          'DUAL GOAL ANSWER RULES (strict — weight loss + muscle):',
          '- One metabolic pick (prefer retatrutide) + one muscle pick (prefer ipamorelin).',
          '- Two short lines/bullets total — not two essays.',
          '- peptideIds MUST start with those two primaries.',
        ].join('\n')
      : muscleQuery
        ? [
            'MUSCLE / LEAN-MASS ANSWER RULES (strict):',
            '- GH secretagogue / muscle peptides only (ipamorelin, CJC-1295, sermorelin, IGF analogs).',
            '- No weight-loss incretins unless they asked for both goals.',
            '- Name 2–3 top options briefly; put the rest in peptideIds.',
          ].join('\n')
        : appetiteFollowUp
          ? [
              'APPETITE / COMPLEMENT FOLLOW-UP RULES (strict):',
              '- Prefer cagrilintide (amylin path) as the main complement.',
              '- 2–3 short sentences + peptideIds. No long mechanism essay.',
            ].join('\n')
          : weightQuery
            ? [
                'WEIGHT-LOSS ANSWER RULES:',
                '- Metabolic / fat-loss peptides only.',
                '- Name the top 1–3 options briefly; details live in the cards.',
              ].join('\n')
            : '',
    'CONTENT RULES:',
    '- PEPTIDES ONLY from the knowledge context / dosing guide.',
    '- Always return peptideIds for recommended peptides (up to 6–8) for UI cards.',
    '- Stay on the user’s CURRENT research goal.',
    '- Never invent personal prescriptions or injection technique steps.',
    '',
    'KNOWLEDGE BASE CONTEXT:',
    knowledgeContext,
    dosingGuide ? `\nRESEARCH DOSING / TIER GUIDE:\n${dosingGuide}` : '',
    '',
    `Retrieval focus used for grounding: ${groundingQuery}`,
    `Original user question: ${userMessage}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function wantsImmediatePicks(text: string): boolean {
  return /\b(show me (the )?(options|peptides|picks|list)|just (show|give|list)|give me (the )?(options|peptides|list|picks)|what are the (top|best) (3|three|options|peptides)|skip (the )?(questions|quiz))\b/i.test(
    text,
  );
}

function isDiscoveryGuidanceTurn(content: string): boolean {
  return /\b(narrow|quick check|quick question|tap a question|which matters more|help me point you|want me to narrow|one quick question)\b/i.test(
    content,
  );
}

function isDiscoveryResultTurn(content: string): boolean {
  return (
    content === PICKS_ONLY_ANSWER ||
    /\b(here are the (top|main)|options people (compare|start)|shortlist to start|cards below)\b/i.test(
      content,
    )
  );
}

function countDiscoveryGuidanceTurns(history: ResearchChatTurn[]): number {
  return history.filter(
    (turn) => turn.role === 'assistant' && isDiscoveryGuidanceTurn(turn.content),
  ).length;
}

/**
 * Deliver concrete options once we've already asked (or the user skips ahead).
 * Keeps discovery to ~2 assistant replies — no infinite quiz.
 */
function shouldDeliverDiscoveryResult(
  history: ResearchChatTurn[],
  userMessage: string,
): boolean {
  if (wantsImmediatePicks(userMessage)) return true;
  if (countDiscoveryGuidanceTurns(history) >= 1) return true;
  if (history.some((turn) => turn.role === 'assistant' && isDiscoveryResultTurn(turn.content))) {
    return true;
  }
  // 2nd+ user message in the thread → stop clarifying, show options.
  const userTurns = history.filter((turn) => turn.role === 'user').length;
  if (userTurns >= 1 && isDiscoveryNarrowingFollowUp(history, userMessage)) {
    return true;
  }
  if (userTurns >= 2) return true;
  return false;
}

/** True when the user is answering a prior discovery follow-up. */
function isDiscoveryNarrowingFollowUp(
  history: ResearchChatTurn[],
  userMessage: string,
): boolean {
  if (wantsImmediatePicks(userMessage)) return true;
  const lastAssistant = [...history]
    .reverse()
    .find((turn) => turn.role === 'assistant');
  if (!lastAssistant || !isDiscoveryGuidanceTurn(lastAssistant.content)) {
    return false;
  }
  return userMessage.trim().length > 0;
}

function buildWeightLossGuidanceResponse(): PepGuideAiResponse {
  return pepGuideResponseSchema.parse({
    answer: [
      'For fat loss, research mostly looks at **appetite / metabolism peptides** (the GLP-1 style group).',
      '',
      'One quick question so I can show you the right shortlist: is **hunger** your main issue, or overall fat-loss results?',
      '',
      'Tap below — next reply I’ll give you options.',
    ].join('\n'),
    classification: 'research_goal_exploration',
    safetyAction: 'allow',
    evidenceCards: [],
    citations: [],
    suggestedQuestions: [
      'Hunger is my main issue',
      'Overall fat-loss results',
      'Just show me the top options',
    ],
    peptideIds: [],
  });
}

function buildMuscleGuidanceResponse(
  classification: PepGuideAiResponse['classification'] = 'research_goal_exploration',
): PepGuideAiResponse {
  return pepGuideResponseSchema.parse({
    answer: [
      'For adding size, research usually points at **GH-related peptides** for recovery and lean mass — not fat-loss shots.',
      '',
      'One quick question: care more about **recovery between training**, or **lean mass / size**?',
      '',
      'Tap below — next reply I’ll give you options.',
    ].join('\n'),
    classification,
    safetyAction: 'allow',
    evidenceCards: [],
    citations: [],
    suggestedQuestions: [
      'Recovery between training',
      'Lean mass / size',
      'Just show me the top options',
    ],
    peptideIds: [],
  });
}

function buildWeightLossPicksResponse(
  userMessage = '',
): PepGuideAiResponse {
  const appetiteFocus = /\b(hunger|hungry|appetite|craving|satiety)\b/i.test(
    userMessage,
  );
  const simpleStart =
    /\b(simple|starter|starting|beginner|milder|easier)\b/i.test(userMessage);
  const peptideIds = getWeightLossGuideIds(8);
  // Keep order from guide; light intro copy only.
  const cardSource = peptideIds
    .map((id) => getCompoundById(id))
    .filter((compound): compound is NonNullable<typeof compound> => Boolean(compound));

  const lead = appetiteFocus
    ? 'Got it — if hunger is the main issue, these are the fat-loss research options people usually start comparing:'
    : simpleStart
      ? 'Cool — here’s a simple shortlist to start with. Cards below have the research ranges:'
      : 'Here are the top fat-loss research options to compare. Keep it simple — cards below have the ranges:';

  return pepGuideResponseSchema.parse({
    answer: `${lead}\n\nResearch framing only.`,
    classification: 'research_goal_exploration',
    safetyAction: 'allow',
    evidenceCards: cardSource.map((compound) => ({
      peptideId: compound.id,
      name: compound.name,
      aliases: compound.aliases,
      researchCategory: compound.researchAreas[0] ?? 'Weight research',
      relevanceSummary: compound.summary,
      proposedMechanism: compound.proposedMechanism,
      humanEvidenceGrade: compound.humanEvidenceGrade,
      preclinicalEvidenceGrade: compound.preclinicalEvidenceGrade,
      regulatoryStatus: compound.regulatoryStatus,
      regulatoryDetail: compound.regulatoryDetail,
      knownRisks: compound.risks,
      uncertainties: compound.uncertainties,
      citationCount: compound.references.length,
      lastReviewedAt: compound.lastReviewedAt,
    })),
    citations: cardSource.flatMap((compound) => compound.references),
    // Terminal prompts — don’t reopen the discovery quiz.
    suggestedQuestions: [
      'Explain the #1 option in plain English',
      'What if I’m still hungry on the top option?',
    ],
    peptideIds,
  });
}

function buildMusclePicksResponse(
  classification: PepGuideAiResponse['classification'] = 'research_goal_exploration',
  userMessage = '',
): PepGuideAiResponse {
  const recoveryFocus = /\b(recover(?:y|ing)?|sore|training)\b/i.test(
    userMessage,
  );
  const peptideIds = getMuscleTopIds(6);
  const compounds = peptideIds
    .map((id) => getCompoundById(id))
    .filter((compound): compound is NonNullable<typeof compound> => Boolean(compound));

  const lead = recoveryFocus
    ? 'If recovery is the focus, these GH-axis options come up most often:'
    : 'Here are the main size / lean-mass research options people compare:';

  return pepGuideResponseSchema.parse({
    answer: `${lead}\n\nResearch framing only.`,
    classification,
    safetyAction: 'allow',
    evidenceCards: compounds.map((compound) => ({
      peptideId: compound.id,
      name: compound.name,
      aliases: compound.aliases,
      researchCategory: compound.researchAreas[0] ?? 'Muscle research',
      relevanceSummary: compound.summary,
      proposedMechanism: compound.proposedMechanism,
      humanEvidenceGrade: compound.humanEvidenceGrade,
      preclinicalEvidenceGrade: compound.preclinicalEvidenceGrade,
      regulatoryStatus: compound.regulatoryStatus,
      regulatoryDetail: compound.regulatoryDetail,
      knownRisks: compound.risks,
      uncertainties: compound.uncertainties,
      citationCount: compound.references.length,
      lastReviewedAt: compound.lastReviewedAt,
    })),
    citations: compounds.flatMap((compound) => compound.references),
    suggestedQuestions: [
      'Explain ipamorelin in plain English',
      'How do ipamorelin and CJC-1295 differ?',
    ],
    peptideIds,
  });
}

/** One primary for fat loss + one primary for muscle when both goals are asked. */
function buildDualGoalResponse(): PepGuideAiResponse {
  const weightId = getWeightLossGuideIds(1)[0] ?? 'retatrutide';
  const muscleId = getMuscleTopIds(1)[0] ?? 'ipamorelin';
  const peptideIds = filterPeptideIds([
    weightId,
    muscleId,
    ...getWeightLossGuideIds(4).filter((id) => id !== weightId),
    ...getMuscleTopIds(4).filter((id) => id !== muscleId),
  ]).slice(0, 8);

  const weight = getCompoundById(weightId);
  const muscle = getCompoundById(muscleId);
  const cardSource = peptideIds
    .map((id) => getCompoundById(id))
    .filter((compound): compound is NonNullable<typeof compound> => Boolean(compound));

  return pepGuideResponseSchema.parse({
    answer: [
      'You’re chasing two goals, so research usually splits them:',
      '',
      `- **Fat loss:** ${weight?.name ?? 'Retatrutide'}`,
      `- **Size / lean mass:** ${muscle?.name ?? 'Ipamorelin'}`,
      '',
      'Different jobs — not one magic stack. Want me to narrow either side?',
    ].join('\n'),
    classification: 'research_goal_exploration',
    safetyAction: 'allow',
    evidenceCards: cardSource.map((compound) => ({
      peptideId: compound.id,
      name: compound.name,
      aliases: compound.aliases,
      researchCategory: compound.researchAreas[0] ?? 'Research',
      relevanceSummary: compound.summary,
      proposedMechanism: compound.proposedMechanism,
      humanEvidenceGrade: compound.humanEvidenceGrade,
      preclinicalEvidenceGrade: compound.preclinicalEvidenceGrade,
      regulatoryStatus: compound.regulatoryStatus,
      regulatoryDetail: compound.regulatoryDetail,
      knownRisks: compound.risks,
      uncertainties: compound.uncertainties,
      citationCount: compound.references.length,
      lastReviewedAt: compound.lastReviewedAt,
    })),
    citations: cardSource.flatMap((compound) => compound.references),
    suggestedQuestions: [
      'Tell me more about retatrutide for weight-loss research',
      'How do ipamorelin and CJC-1295 differ for muscle research?',
    ],
    peptideIds,
  });
}

function buildAppetiteComplementResponse(
  userMessage: string,
  history: ResearchChatTurn[],
): PepGuideAiResponse {
  const historyText = history.map((turn) => turn.content).join(' ');
  const tried = findMentionedMetabolicIds(`${userMessage} ${historyText}`);
  const triedLabel =
    tried
      .map((id) => getCompoundById(id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(' / ') || 'an incretin agonist';

  const complementIds = getAppetiteComplementIds(2);
  const peptideIds = filterPeptideIds([
    ...complementIds,
    ...getWeightLossGuideIds(8).filter((id) => !tried.includes(id)),
  ]).slice(0, 8);
  const compounds = peptideIds
    .map((id) => getCompoundById(id))
    .filter((compound): compound is NonNullable<typeof compound> => Boolean(compound));

  const primary = compounds.find((c) => c.id === complementIds[0]) ?? compounds[0];
  const secondary = compounds.find((c) => c.id === complementIds[1]) ?? compounds[1];

  return pepGuideResponseSchema.parse({
    answer: [
      `If appetite is still loud on **${triedLabel}**, research usually looks at a different satiety path — not another GLP-1.`,
      '',
      primary ? `- **${primary.name}** (amylin) is the common add-on discussed.` : '',
      secondary ? `- **${secondary.name}** is another option in that lane.` : '',
      '',
      'Research framing only.',
    ]
      .filter(Boolean)
      .join('\n'),
    classification: 'compound_comparison',
    safetyAction: 'allow',
    evidenceCards: compounds.slice(0, 4).map((compound) => ({
      peptideId: compound.id,
      name: compound.name,
      aliases: compound.aliases,
      researchCategory: compound.researchAreas[0] ?? 'Weight research',
      relevanceSummary: compound.summary,
      proposedMechanism: compound.proposedMechanism,
      humanEvidenceGrade: compound.humanEvidenceGrade,
      preclinicalEvidenceGrade: compound.preclinicalEvidenceGrade,
      regulatoryStatus: compound.regulatoryStatus,
      regulatoryDetail: compound.regulatoryDetail,
      knownRisks: compound.risks,
      uncertainties: compound.uncertainties,
      citationCount: compound.references.length,
      lastReviewedAt: compound.lastReviewedAt,
    })),
    citations: compounds.flatMap((compound) => compound.references),
    suggestedQuestions: [
      'How was cagrilintide studied with semaglutide?',
      'What are the main risks of amylin analogs?',
    ],
    peptideIds,
  });
}

function buildFallbackFromKnowledge(
  userMessage: string,
  retrievalQuery: string,
  classification: PepGuideAiResponse['classification'] = 'research_goal_exploration',
  history: ResearchChatTurn[] = [],
): PepGuideAiResponse {
  if (isDualWeightMuscleQuery(userMessage)) {
    return buildDualGoalResponse();
  }

  if (shouldReturnWeightLossPicks(userMessage, history)) {
    return shouldDeliverDiscoveryResult(history, userMessage)
      ? buildWeightLossPicksResponse(userMessage)
      : buildWeightLossGuidanceResponse();
  }

  if (
    !isMuscleQuery(userMessage) &&
    (isAppetiteComplementQuery(userMessage) || isMetabolicFollowUp(userMessage))
  ) {
    return buildAppetiteComplementResponse(userMessage, history);
  }

  if (shouldReturnMusclePicks(userMessage)) {
    return shouldDeliverDiscoveryResult(history, userMessage)
      ? buildMusclePicksResponse(classification, userMessage)
      : buildMuscleGuidanceResponse(classification);
  }

  const groundingQuery = buildGroundingQuery(
    userMessage,
    retrievalQuery,
    history,
  );
  const compounds = searchKnowledge(groundingQuery, 8);
  const peptideIds = compounds.map((compound) => compound.id);

  return pepGuideResponseSchema.parse({
    answer: [
      compounds.length > 0
        ? 'Here’s what usually comes up for that:'
        : 'Not seeing a clean peptide match — try naming a compound or goal (fat loss, size, recovery).',
      '',
      ...compounds.slice(0, 4).map(
        (compound) => `- **${compound.name}** — ${compound.summary}`,
      ),
      '',
      compounds.length > 0 ? 'Want the short version on any of these?' : '',
    ]
      .filter(Boolean)
      .join('\n'),
    classification,
    safetyAction: 'allow',
    evidenceCards: compounds.map((compound) => ({
      peptideId: compound.id,
      name: compound.name,
      aliases: compound.aliases,
      researchCategory: compound.researchAreas[0] ?? 'General education',
      relevanceSummary: compound.summary,
      proposedMechanism: compound.proposedMechanism,
      humanEvidenceGrade: compound.humanEvidenceGrade,
      preclinicalEvidenceGrade: compound.preclinicalEvidenceGrade,
      regulatoryStatus: compound.regulatoryStatus,
      regulatoryDetail: compound.regulatoryDetail,
      knownRisks: compound.risks,
      uncertainties: compound.uncertainties,
      citationCount: compound.references.length,
      lastReviewedAt: compound.lastReviewedAt,
    })),
    citations: compounds.flatMap((compound) => compound.references),
    suggestedQuestions: [
      'What human evidence is available for these compounds?',
      'How do their regulatory statuses differ?',
      'What uncertainties should I keep in mind?',
    ],
    peptideIds,
  });
}

function buildRefusalResponse(
  category: PepGuideAiResponse['classification'],
  safetyAction: PepGuideAiResponse['safetyAction'],
): PepGuideAiResponse {
  const isSoftRedirect =
    category === 'out_of_scope' || category === 'spam';

  return pepGuideResponseSchema.parse({
    answer:
      REFUSAL_ANSWERS[category] ??
      'I can’t help with that request, but I can discuss peptide research, mechanisms, evidence, and research dosing ranges.',
    classification: category,
    safetyAction,
    evidenceCards: [],
    citations: [],
    suggestedQuestions: isSoftRedirect
      ? [
          'Show me a weight-loss research tier list with dosing ranges',
          'How does retatrutide differ from tirzepatide?',
          'What is BPC-157 researched for?',
        ]
      : [
          'Show me a weight-loss research tier list with dosing ranges',
          'How does retatrutide differ from tirzepatide?',
          'What evidence grades mean in PepGuide?',
        ],
    peptideIds: [],
  });
}

function buildProUnlockResponse(isPro: boolean): PepGuideAiResponse {
  if (isPro) {
    return pepGuideResponseSchema.parse({
      answer:
        'PepGuide Pro is already unlocked. Open **Education & Research** for video lessons, **Protocols** for goal-built stacks, and **Questions & Discussion** for the member community — all under PepGuide Pro in the sidebar.',
      classification: 'pro_content_inquiry',
      safetyAction: 'allow',
      evidenceCards: [],
      citations: [],
      suggestedQuestions: [
        'Which peptides are researched for metabolic health?',
        'Compare BPC-157 and TB-500 research.',
        'Summarize current retatrutide research.',
      ],
      peptideIds: [],
    });
  }

  return pepGuideResponseSchema.parse({
    answer: PRO_UNLOCK_ANSWER,
    classification: 'pro_content_inquiry',
    safetyAction: 'allow',
    evidenceCards: [],
    citations: [],
    suggestedQuestions: [
      'Which peptides are researched for metabolic health?',
      'Compare BPC-157 and TB-500 research.',
      'Show me a weight-loss research tier list with dosing ranges',
    ],
    peptideIds: [],
  });
}

export async function generateResearchResponse(
  userMessage: string,
  history: ResearchChatTurn[] = [],
  options: { isPro?: boolean } = {},
): Promise<ResearchGenerationResult> {
  const priorTurns = normalizeHistory(history);
  const classification = classifyMessage(userMessage);

  if (
    classification.category === 'pro_content_inquiry' ||
    isProContentInquiry(userMessage)
  ) {
    return buildProUnlockResponse(Boolean(options.isPro));
  }

  const softRedirectCategories = new Set([
    'personalized_dosing_request',
    'cycle_or_stack_construction',
    'out_of_scope',
  ]);
  const isHardRefuse =
    (classification.safetyAction === 'refuse' ||
      classification.safetyAction === 'urgent_warning') &&
    !softRedirectCategories.has(classification.category);

  if (isHardRefuse) {
    return buildRefusalResponse(
      classification.category,
      classification.safetyAction,
    );
  }

  // Normalize slang / natural language into PepGuide goals before answering.
  const { intent, usage: intentUsage } =
    await summarizeResearchIntent(userMessage);

  if (
    classification.safetyAction === 'refuse' ||
    classification.safetyAction === 'urgent_warning'
  ) {
    const soft = routeFromIntent(intent, userMessage, priorTurns);
    if (soft) {
      return withUsage(soft, intentUsage);
    }
    if (
      intent.goal !== 'off_topic' &&
      (isDualWeightMuscleQuery(userMessage) ||
        shouldReturnWeightLossPicks(userMessage, priorTurns) ||
        shouldReturnMusclePicks(userMessage) ||
        isAppetiteComplementQuery(userMessage) ||
        isMetabolicFollowUp(userMessage) ||
        isMuscleQuery(userMessage))
    ) {
      return withUsage(
        buildFallbackFromKnowledge(
          userMessage,
          intent.retrievalQuery || classification.retrievalQuery,
          'research_goal_exploration',
          priorTurns,
        ),
        intentUsage,
      );
    }
    return buildRefusalResponse(
      classification.category,
      classification.safetyAction,
    );
  }

  if (intent.goal === 'off_topic') {
    return withUsage(
      buildRefusalResponse('out_of_scope', 'refuse'),
      intentUsage,
    );
  }

  const retrievalQuery =
    intent.retrievalQuery || classification.retrievalQuery;

  // Route discovery asks from normalized intent (then keyword fallback).
  const deliverResult = shouldDeliverDiscoveryResult(priorTurns, userMessage);
  const routed =
    routeFromIntent(intent, userMessage, priorTurns) ??
    (isDualWeightMuscleQuery(userMessage)
      ? buildDualGoalResponse()
      : shouldReturnMusclePicks(userMessage)
        ? deliverResult
          ? buildMusclePicksResponse(classification.category, userMessage)
          : buildMuscleGuidanceResponse(classification.category)
        : shouldReturnWeightLossPicks(userMessage, priorTurns)
          ? deliverResult
            ? buildWeightLossPicksResponse(userMessage)
            : buildWeightLossGuidanceResponse()
          : null);

  if (routed) {
    return withUsage(routed, intentUsage);
  }

  const groundingQuery = buildGroundingQuery(
    userMessage,
    `${retrievalQuery} ${intent.keywords.join(' ')}`.trim(),
    priorTurns,
  );

  const apiKey = getOpenAiKey();
  if (!apiKey) {
    return withUsage(
      buildFallbackFromKnowledge(
        userMessage,
        retrievalQuery,
        classification.category,
        priorTurns,
      ),
      intentUsage,
    );
  }

  const topicPivot =
    isTopicPivot(userMessage) ||
    intent.goal === 'muscle' ||
    intent.goal === 'recovery' ||
    intent.goal === 'sleep';
  // On a clear topic change, don't feed the old weight-loss thread into the model.
  const historyForModel = topicPivot
    ? ([
        {
          role: 'user' as const,
          content:
            '[Earlier in this chat the user discussed a different research topic. They have now changed goals — answer only the new question.]',
        },
      ] satisfies ResearchChatTurn[])
    : priorTurns;

  let parsedContent: unknown;
  let usage: TokenUsage | undefined = intentUsage;
  try {
    const client = new OpenAI({ apiKey });
    const systemPrompt = [
      buildSystemPrompt(userMessage, retrievalQuery, priorTurns),
      '',
      'NORMALIZED USER INTENT (from classifier — follow this goal):',
      `- Goal: ${intent.goal}`,
      `- Summary: ${intent.summary}`,
      `- Keywords: ${intent.keywords.join(', ')}`,
    ].join('\n');
    const completion = await client.chat.completions.create({
      model: PEP_GUIDE_MODEL,
      temperature: 0.2,
      max_tokens: 320,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...historyForModel.map((turn) => ({
          role: turn.role as 'user' | 'assistant',
          content: turn.content,
        })),
        { role: 'user', content: userMessage },
      ],
    });

    const promptTokens = completion.usage?.prompt_tokens;
    const completionTokens = completion.usage?.completion_tokens;
    const completionUsage: TokenUsage =
      typeof promptTokens === 'number' || typeof completionTokens === 'number'
        ? {
            inputTokens: promptTokens ?? 0,
            outputTokens: completionTokens ?? 0,
          }
        : {
            inputTokens: estimateTokens(
              `${systemPrompt}${userMessage}${historyForModel.reduce(
                (sum, turn) => sum + turn.content.length,
                0,
              )}`,
            ),
            outputTokens: estimateTokens(
              completion.choices[0]?.message?.content ?? '',
            ),
          };
    usage = mergeUsage(intentUsage, completionUsage);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return {
        ...buildFallbackFromKnowledge(
          userMessage,
          retrievalQuery,
          classification.category,
          priorTurns,
        ),
        usage,
      };
    }
    parsedContent = JSON.parse(content);
  } catch (error) {
    console.error('OpenAI research generation failed', error);
    return withUsage(
      buildFallbackFromKnowledge(
        userMessage,
        retrievalQuery,
        classification.category,
        priorTurns,
      ),
      intentUsage,
    );
  }

  const parsed = pepGuideResponseSchema.safeParse(parsedContent);
  if (!parsed.success) {
    return withUsage(
      buildFallbackFromKnowledge(
        userMessage,
        retrievalQuery,
        classification.category,
        priorTurns,
      ),
      intentUsage,
    );
  }

  const grounded = searchKnowledge(groundingQuery, 8);
  const groundedIds = new Set(grounded.map((compound) => compound.id));

  // For appetite follow-ups only, allow amylin complements even if ranking is noisy.
  if (
    !isDualWeightMuscleQuery(userMessage) &&
    !isMuscleQuery(userMessage) &&
    (isAppetiteComplementQuery(userMessage) || isMetabolicFollowUp(userMessage))
  ) {
    for (const id of getAppetiteComplementIds(3)) {
      groundedIds.add(id);
    }
  }

  if (isDualWeightMuscleQuery(userMessage)) {
    for (const id of getWeightLossGuideIds(3)) groundedIds.add(id);
    for (const id of getMuscleTopIds(3)) groundedIds.add(id);
  } else if (isMuscleQuery(userMessage)) {
    for (const id of getMuscleTopIds(5)) {
      groundedIds.add(id);
    }
  }

  const modelIds = filterPeptideIds(
    parsed.data.peptideIds.filter((id) => groundedIds.has(id)),
  );
  const needsGrounding =
    parsed.data.evidenceCards.length === 0 ||
    modelIds.length === 0 ||
    !parsed.data.evidenceCards.every(
      (card) => groundedIds.has(card.peptideId) && isPeptideCompoundCard(card.peptideId),
    );

  const forcedIds = isDualWeightMuscleQuery(userMessage)
    ? filterPeptideIds([
        getWeightLossGuideIds(1)[0] ?? 'retatrutide',
        getMuscleTopIds(1)[0] ?? 'ipamorelin',
        ...modelIds,
        ...getWeightLossGuideIds(3),
        ...getMuscleTopIds(3),
      ]).slice(0, 8)
    : isMuscleQuery(userMessage)
      ? filterPeptideIds(
          modelIds.length > 0 ? modelIds : getMuscleTopIds(6),
        ).slice(0, 8)
      : null;

  if (needsGrounding) {
    const fallback = buildFallbackFromKnowledge(
      userMessage,
      retrievalQuery,
      classification.category,
      priorTurns,
    );
    return {
      ...parsed.data,
      classification: classification.category,
      evidenceCards:
        parsed.data.evidenceCards.length > 0
          ? parsed.data.evidenceCards.filter(
              (card) =>
                groundedIds.has(card.peptideId) &&
                isPeptideCompoundCard(card.peptideId),
            )
          : fallback.evidenceCards,
      citations:
        parsed.data.citations.length > 0
          ? parsed.data.citations
          : fallback.citations,
      peptideIds: filterPeptideIds(
        forcedIds ??
          (modelIds.length > 0 ? modelIds : fallback.peptideIds),
      ),
      answer: parsed.data.answer || fallback.answer,
      usage,
    };
  }

  return {
    ...parsed.data,
    classification: classification.category,
    peptideIds: filterPeptideIds(forcedIds ?? modelIds),
    evidenceCards: parsed.data.evidenceCards.filter((card) =>
      isPeptideCompoundCard(card.peptideId),
    ),
    usage,
  };
}

function isPeptideCompoundCard(id: string): boolean {
  return Boolean(getCompoundById(id)?.isPeptide);
}
