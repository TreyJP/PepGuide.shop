import OpenAI from 'openai';

import { PEP_GUIDE_MODEL } from '@/src/constants/ai';
import {
  buildKnowledgeContext,
  filterPeptideIds,
  findMentionedCompoundIds,
  getCompoundById,
  getCompoundsByCategory,
  searchKnowledge,
} from '@/src/data/knowledge';
import { PICKS_ONLY_ANSWER, PRO_UNLOCK_ANSWER } from '@/src/constants/chat';
import {
  findMentionedMetabolicIds,
  getAppetiteComplementIds,
  getHungerGuideIds,
  getWeightLossGuideIds,
  METABOLIC_TIER_GUIDE,
} from '@/src/data/knowledge/metabolic-guide';
import { getMuscleTopIds, MUSCLE_RESEARCH_GUIDE } from '@/src/data/knowledge/muscle-guide';
import type { KnowledgeCategory, KnowledgeCompound } from '@/src/data/knowledge/types';
import { PEP_GUIDE_KNOWLEDGE_PREAMBLE } from '@/src/data/knowledge/system-context';
import {
  classifyMessage,
  hasInScopeSignal,
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

function isPlainEnglishExplainRequest(text: string): boolean {
  return (
    /\bin plain english\b/i.test(text) ||
    /\bexplain (the )?(#\s*1|number one|top) option\b/i.test(text)
  );
}

function resolvePlainEnglishTargetId(
  userMessage: string,
  history: ResearchChatTurn[] = [],
): string {
  const mentioned = findMentionedCompoundIds(userMessage);
  if (mentioned[0]) return mentioned[0]!;

  const appetiteContext = history.some(
    (turn) =>
      turn.role === 'assistant' &&
      /\b(hunger|cagrilintide|\bcag\b|satiety|amylin)\b/i.test(turn.content),
  );
  const muscleContext = history.some(
    (turn) =>
      turn.role === 'assistant' &&
      /\b(size \/ lean-mass|GH-axis|ipamorelin|muscle)\b/i.test(turn.content),
  );

  if (appetiteContext) return getHungerGuideIds(1)[0] ?? 'cagrilintide';
  if (muscleContext) return getMuscleTopIds(1)[0] ?? 'ipamorelin';
  return getWeightLossGuideIds(1)[0] ?? 'retatrutide';
}

function buildPlainEnglishExplainerResponse(
  userMessage: string,
  history: ResearchChatTurn[] = [],
): PepGuideAiResponse {
  const peptideId = resolvePlainEnglishTargetId(userMessage, history);
  const compound = getCompoundById(peptideId);
  const metabolic = METABOLIC_TIER_GUIDE.find((entry) => entry.id === peptideId);
  const muscle = MUSCLE_RESEARCH_GUIDE.find((entry) => entry.id === peptideId);
  const name = compound?.name ?? metabolic?.name ?? muscle?.name ?? 'This option';
  const why =
    metabolic?.why ??
    muscle?.why ??
    compound?.summary ??
    'It’s one of the main research options people compare for this goal.';
  const dosing =
    metabolic?.researchDosing ??
    muscle?.researchDosing ??
    'Check the card for published research ranges.';
  const simpleSummary =
    compound?.summary?.replace(/\s+/g, ' ').trim() ||
    'Researchers study it for this goal; details are still evolving.';

  return pepGuideResponseSchema.parse({
    answer: [
      `**${name}**, in plain English:`,
      '',
      simpleSummary.length > 220
        ? `${simpleSummary.slice(0, 217).trim()}…`
        : simpleSummary,
      '',
      `• Why it ranks highly: ${why}`,
      `• Research dosing talk: ${dosing}`,
      '',
      'Research framing only — not personal medical advice.',
    ].join('\n'),
    classification: 'compound_comparison',
    safetyAction: 'allow',
    evidenceCards: compound
      ? [
          {
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
          },
        ]
      : [],
    citations: compound?.references ?? [],
    suggestedQuestions: [
      `How does ${name} compare to the next option?`,
      `What are the main risks people research for ${name}?`,
    ],
    peptideIds: [peptideId],
  });
}

/** Prefer LLM-normalized intent; fall back to keyword heuristics. */
function routeFromIntent(
  intent: ResearchIntent,
  userMessage: string,
  history: ResearchChatTurn[],
): PepGuideAiResponse | null {
  // Chip / follow-up: “explain #1 / X in plain English” — never re-dump the picks list.
  if (isPlainEnglishExplainRequest(userMessage)) {
    return buildPlainEnglishExplainerResponse(userMessage, history);
  }

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

  // Already tried a peptide that wasn’t enough → next/add-on options, never repeat it.
  if (isTriedCompoundFollowUp(userMessage, history)) {
    return buildTriedCompoundFollowUpResponse(userMessage, history);
  }

  // Quiz chips / “just show me the top options” finish the open discovery arc.
  if (priorWasWeight && isWeightDiscoveryChip(userMessage)) {
    return buildWeightLossPicksResponse(userMessage);
  }
  if (priorWasMuscle && isMuscleDiscoveryChip(userMessage)) {
    return buildMusclePicksResponse('research_goal_exploration', userMessage);
  }

  // New research lane — never finish an old GLP / muscle discovery arc.
  if (isTopicPivot(userMessage) || isDistinctGoalLane(intent.goal)) {
    return null;
  }

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
      // Mid-discovery chip ("Hunger is my main issue") → appetite-focused picks.
      // Post-trial hunger is handled above and never reaches here.
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
      // Finish the open discovery arc when the user is still answering that quiz.
      if (deliverResult && priorWasWeight && !isTopicPivot(userMessage)) {
        return buildWeightLossPicksResponse(userMessage);
      }
      if (deliverResult && priorWasMuscle && !isTopicPivot(userMessage)) {
        return buildMusclePicksResponse(
          'research_goal_exploration',
          userMessage,
        );
      }
      return null;
  }
}

/** Goals that should never inherit a prior weight-loss / muscle discovery arc. */
function isDistinctGoalLane(goal: ResearchIntent['goal']): boolean {
  return (
    goal === 'skin_hair' ||
    goal === 'recovery' ||
    goal === 'sleep' ||
    goal === 'cognitive' ||
    goal === 'sexual' ||
    goal === 'longevity'
  );
}

function isSkinHairQuery(text: string): boolean {
  return /\b(tan|tanning|tanned|sunless\s+tan|darker\s+skin|melanotan|mt-?1|mt-?2|pigment(?:ation)?|skin|hair|cosmetic|wrinkle)\b/i.test(
    text,
  );
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
  return /\b(lose\s+weight|weight\s*loss|losing\s+weight|fat[- ]?loss|lose\s+fat|obesity|obese|overweight|glp-?1|incretin|retatrutide|semaglutide|tirzepatide|slim\s+down|appetite|hunger|hungry|satiety|craving|burn\s+fat|cut\s+fat|belly\s*fat)\b/i.test(
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
  if (isPlainEnglishExplainRequest(userMessage)) return false;
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

/** Discovery chips from the fat-loss / muscle clarifying reply. */
function isWeightDiscoveryChip(text: string): boolean {
  return /^(hunger is my main issue|overall fat[- ]?loss results|just show me the top options)\.?$/i.test(
    text.trim(),
  );
}

function isMuscleDiscoveryChip(text: string): boolean {
  return /^(recovery between training|lean mass\s*\/\s*size|just show me the top options)\.?$/i.test(
    text.trim(),
  );
}

/** @deprecated Use isWeightDiscoveryChip — kept for older call sites. */
function isDiscoveryHungerChip(text: string): boolean {
  return isWeightDiscoveryChip(text);
}

const DISSATISFACTION_RE =
  /\b(still|not enough|wasn'?t enough|didn'?t (work|help|cut it|do (?:much|it|enough))|doesn'?t work|isn'?t (working|helping)|wasn'?t (working|helping)|need(?:s|ed)? more|add[- ]?on|on top|alongside|combine|hungry|sore|in pain|no (?:real )?gains?|no results?|barely (?:helped|working)|left me)\b/i;

const TRIED_LANGUAGE_RE =
  /\b(took|taking|tried|try(?:ing)?|been on|i'?m on|was on|using|used|ran|running)\b/i;

/**
 * User already tried any peptide and it wasn’t enough —
 * suggest next / add-on options; never re-pitch the same compound.
 */
function isTriedCompoundFollowUp(
  userMessage: string,
  history: ResearchChatTurn[] = [],
): boolean {
  if (isDiscoveryHungerChip(userMessage)) return false;

  // Pure explain/compare questions are not “tried and failed” follow-ups.
  if (
    /\b(how|why|mechanism|evidence|risk|side effect|compare|vs\.?|versus|differ|trial|study|what is)\b/i.test(
      userMessage,
    ) &&
    !DISSATISFACTION_RE.test(userMessage)
  ) {
    return false;
  }

  const corpus = `${userMessage} ${history.map((turn) => turn.content).join(' ')}`;
  const mentionedNow = findMentionedCompoundIds(userMessage);
  const mentionedAny = findMentionedCompoundIds(corpus);
  const dissatisfied = DISSATISFACTION_RE.test(userMessage);
  const triedLanguage = TRIED_LANGUAGE_RE.test(userMessage);

  if (mentionedNow.length > 0 && dissatisfied) return true;
  if (triedLanguage && dissatisfied && mentionedAny.length > 0) return true;
  if (
    dissatisfied &&
    (triedLanguage || /\bstill\b/i.test(userMessage)) &&
    history.some(
      (turn) => turn.role === 'assistant' && isDiscoveryResultTurn(turn.content),
    )
  ) {
    return true;
  }
  return false;
}

function collectTriedCompoundIds(
  userMessage: string,
  history: ResearchChatTurn[] = [],
): string[] {
  const fromMessage = findMentionedCompoundIds(userMessage);
  if (fromMessage.length > 0) return fromMessage;
  return findMentionedCompoundIds(
    history.map((turn) => turn.content).join(' '),
  );
}

function alternativesForTriedCompounds(
  triedIds: string[],
  userMessage: string,
  limit = 4,
): KnowledgeCompound[] {
  const tried = new Set(triedIds);
  const categories = new Set<KnowledgeCategory>();
  for (const id of triedIds) {
    getCompoundById(id)?.categories.forEach((category) =>
      categories.add(category),
    );
  }

  const orderedIds: string[] = [];

  // Metabolic + residual appetite → amylin add-ons first (not another GLP-1).
  if (
    categories.has('metabolic_weight') &&
    isAppetiteComplementQuery(userMessage)
  ) {
    orderedIds.push(...getAppetiteComplementIds(3));
  } else if (categories.has('metabolic_weight')) {
    orderedIds.push(...getWeightLossGuideIds(8));
  }

  if (
    categories.has('gh_secretagogues') ||
    isMuscleQuery(userMessage) ||
    triedIds.some((id) => getMuscleTopIds(8).includes(id))
  ) {
    orderedIds.push(...getMuscleTopIds(8));
  }

  for (const category of categories) {
    for (const compound of getCompoundsByCategory(category)) {
      orderedIds.push(compound.id);
    }
  }

  // Soft fallback from knowledge search using the complaint + lane.
  for (const compound of searchKnowledge(userMessage, 10)) {
    orderedIds.push(compound.id);
  }

  const unique = filterPeptideIds(orderedIds).filter((id) => !tried.has(id));
  return unique
    .map((id) => getCompoundById(id))
    .filter((compound): compound is KnowledgeCompound => Boolean(compound))
    .slice(0, limit);
}

/**
 * Weight/appetite follow-up on the CURRENT turn only.
 * Requires metabolic context so pivots like "build muscle instead" do not match.
 */
function isMetabolicFollowUp(text: string): boolean {
  if (isMuscleQuery(text) && !isAppetiteComplementQuery(text)) return false;
  if (isDiscoveryHungerChip(text)) return false;

  const metabolicContext =
    isWeightLossQuery(text) || findMentionedMetabolicIds(text).length > 0;
  if (!metabolicContext) return false;

  return /\b(appetite|hunger|hungry|satiety|craving|still hungry|took|taking|tried|add[- ]?on|alongside|on top|combine|combination|complement|pair(?:ed|ing)?(?:\s+with)?|not enough|didn'?t work|doesn'?t work|wasn'?t enough|left me|keep(?:s|ing)? me|residual)\b/i.test(
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
  // Skin / tanning / cosmetic lane (e.g. after a GLP thread).
  if (
    isSkinHairQuery(userMessage) &&
    !isWeightLossQuery(userMessage) &&
    !isMetabolicFollowUp(userMessage)
  ) {
    return true;
  }
  // New non-weight research goal while not continuing metabolic follow-up.
  if (
    !isWeightLossQuery(userMessage) &&
    !isMetabolicFollowUp(userMessage) &&
    /\b(heal(?:ing)?|recover(?:y)?|sleep|libido|cognitive|focus|longevity|anti[- ]?aging)\b/i.test(
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
  if (isPlainEnglishExplainRequest(userMessage)) return false;
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

  if (isSkinHairQuery(userMessage)) {
    parts.push(
      'melanotan melanotan-ii pt-141 tanning pigmentation skin hair cosmetic peptide research',
    );
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
        : isSkinHairQuery(userMessage)
          ? buildKnowledgeContext(
              'melanotan melanotan-ii tanning pigmentation skin hair cosmetic peptide research',
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
    '- If the user pivots to a new research goal (e.g. tanning after GLP-1s, muscle after weight loss), answer ONLY that new goal.',
    '- Do NOT repeat, summarize, or keep recommending compounds from the previous goal unless the user asks to combine goals.',
    '- Do NOT keep recommending weight-loss / GLP-1 compounds when the user asks about tanning, skin, hair, sleep, recovery, or another lane.',
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
              '- User already tried a metabolic option — acknowledge it by name.',
              '- Lead with cagrilintide (cag) as the best hunger / satiety add-on (amylin path).',
              '- NEVER tell them to take the same incretin again (reta/tirz/sema).',
              '- Do not re-list the top GLP-1 tier list ahead of cag.',
              '- 2–3 short sentences + peptideIds starting with cagrilintide.',
            ].join('\n')
          : weightQuery
            ? [
                'WEIGHT-LOSS ANSWER RULES:',
                '- Metabolic / fat-loss peptides only.',
                '- If hunger / appetite is the main issue, lead with cagrilintide (cag).',
                '- Name the top 1–3 options briefly; details live in the cards.',
                '- If they say they already tried one and it was not enough, switch to an add-on path — do not repeat that compound.',
              ].join('\n')
            : '',
    'CONTENT RULES:',
    '- PEPTIDES ONLY from the knowledge context / dosing guide.',
    '- Always return peptideIds for recommended peptides (up to 6–8) for UI cards.',
    '- Stay on the user’s CURRENT research goal.',
    '- TRIED-AND-NOT-ENOUGH (all peptides): if they already used a peptide and still have the problem, acknowledge it and suggest a next/add-on peer in the same lane. Never recommend the same peptide again as the answer (applies to reta, BPC, ipamorelin, TB-500, etc.).',
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
  return (
    isWeightDiscoveryChip(text) ||
    isMuscleDiscoveryChip(text) ||
    /\b(show me (the )?(options|peptides|picks|list)|just (show|give|list)|give me (the )?(options|peptides|list|picks)|what are the (top|best) (3|three|options|peptides)|skip (the )?(questions|quiz))\b/i.test(
      text,
    )
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
  const tried = DISSATISFACTION_RE.test(userMessage)
    ? findMentionedCompoundIds(userMessage)
    : [];
  const baseIds = appetiteFocus
    ? getHungerGuideIds(8)
    : getWeightLossGuideIds(8);
  const peptideIds = tried.length
    ? baseIds.filter((id) => !tried.includes(id))
    : baseIds;
  // Keep order from guide; light intro copy only.
  const cardSource = peptideIds
    .map((id) => getCompoundById(id))
    .filter((compound): compound is NonNullable<typeof compound> => Boolean(compound));
  const topName = cardSource[0]?.name ?? 'the top option';

  const lead = appetiteFocus
    ? 'Got it — for **hunger**, research usually leads with **cagrilintide (cag)** on the satiety / amylin path. Peers to compare are below:'
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
    suggestedQuestions: appetiteFocus
      ? [
          'Tell me more about cagrilintide for hunger',
          'How is cag researched with semaglutide?',
        ]
      : [
          `Explain ${topName} in plain English`,
          `What if I'm still hungry on ${topName}?`,
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
  const tried = DISSATISFACTION_RE.test(userMessage)
    ? findMentionedCompoundIds(userMessage)
    : [];
  const peptideIds = (
    tried.length
      ? getMuscleTopIds(6).filter((id) => !tried.includes(id))
      : getMuscleTopIds(6)
  );
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
      `- **Fat loss:** ${weight?.name ?? 'GL3RT'}`,
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

function buildTriedCompoundFollowUpResponse(
  userMessage: string,
  history: ResearchChatTurn[],
): PepGuideAiResponse {
  const triedIds = collectTriedCompoundIds(userMessage, history);
  const metabolicSet = new Set(getWeightLossGuideIds(20));
  const triedMetabolic = triedIds.filter((id) => metabolicSet.has(id));

  // Metabolic + appetite residual → specialized amylin add-on path.
  if (
    triedMetabolic.length > 0 &&
    (isAppetiteComplementQuery(userMessage) ||
      /\b(hungry|appetite|satiety|craving)\b/i.test(userMessage))
  ) {
    return buildAppetiteComplementResponse(userMessage, history);
  }

  const alternatives = alternativesForTriedCompounds(
    triedIds,
    userMessage,
    4,
  );
  const triedLabel =
    triedIds
      .map((id) => getCompoundById(id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(' / ') || 'that option';

  if (alternatives.length === 0) {
    return pepGuideResponseSchema.parse({
      answer: [
        `Got it — if **${triedLabel}** wasn’t enough, research usually looks at a **different option in the same lane**, not restarting with the same peptide.`,
        '',
        'Tell me the goal you’re still chasing (recovery, size, sleep, etc.) and I’ll shortlist peers.',
        '',
        'Research framing only.',
      ].join('\n'),
      classification: 'compound_comparison',
      safetyAction: 'allow',
      evidenceCards: [],
      citations: [],
      suggestedQuestions: [
        'What recovery peptides are researched next after BPC-157?',
        'What GH peptides pair with ipamorelin in research?',
      ],
      peptideIds: [],
    });
  }

  const primary = alternatives[0];
  const secondary = alternatives[1];
  const peptideIds = filterPeptideIds(alternatives.map((c) => c.id));

  return pepGuideResponseSchema.parse({
    answer: [
      `Got it — if **${triedLabel}** didn’t get you there, research usually looks at a **next / add-on option**, not the same peptide again.`,
      '',
      primary
        ? `- **${primary.name}** is a common peer discussed next in that lane.`
        : '',
      secondary
        ? `- **${secondary.name}** is another option people compare alongside it.`
        : '',
      '',
      'Research framing only — not a personal stack plan.',
    ]
      .filter(Boolean)
      .join('\n'),
    classification: 'compound_comparison',
    safetyAction: 'allow',
    evidenceCards: alternatives.map((compound) => ({
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
    citations: alternatives.flatMap((compound) => compound.references),
    suggestedQuestions: [
      `How does ${primary.name} differ from ${triedLabel}?`,
      'What risks should I compare next?',
    ],
    peptideIds,
  });
}

function buildAppetiteComplementResponse(
  userMessage: string,
  history: ResearchChatTurn[],
): PepGuideAiResponse {
  const historyText = history.map((turn) => turn.content).join(' ');
  const tried = [
    ...findMentionedCompoundIds(`${userMessage} ${historyText}`),
    ...findMentionedMetabolicIds(`${userMessage} ${historyText}`),
  ].filter((id, index, all) => all.indexOf(id) === index);
  // Prefer compounds named in the current message (what they already tried).
  const triedNow = findMentionedCompoundIds(userMessage);
  const triedPrimary = triedNow[0] ?? tried[0];
  const triedLabel =
    (triedPrimary ? getCompoundById(triedPrimary)?.name : null) ||
    tried
      .map((id) => getCompoundById(id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(' / ') ||
    'that incretin';

  // Add-on path only — do not re-list GLP-1/GIP agonists they already tried.
  const complementIds = getAppetiteComplementIds(2).filter(
    (id) => !tried.includes(id),
  );
  const peptideIds = filterPeptideIds(complementIds).slice(0, 4);
  const compounds = peptideIds
    .map((id) => getCompoundById(id))
    .filter((compound): compound is NonNullable<typeof compound> =>
      Boolean(compound),
    );

  const primary =
    compounds.find((c) => c.id === complementIds[0]) ?? compounds[0];
  const secondary =
    compounds.find((c) => c.id === complementIds[1]) ?? compounds[1];

  return pepGuideResponseSchema.parse({
    answer: [
      `Got it — if **${triedLabel}** still left appetite loud, the best researched hunger add-on is usually **cagrilintide (cag)** — amylin satiety path, not another GLP-1 restart.`,
      '',
      primary
        ? `- **${primary.name}**${primary.id === 'cagrilintide' ? ' (cag)' : ''} is the top hunger / satiety complement discussed on top of an incretin.`
        : '',
      secondary
        ? `- **${secondary.name}** is another option in that add-on lane.`
        : '',
      '',
      'Research framing only — not a personal stack plan.',
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
  if (isPlainEnglishExplainRequest(userMessage)) {
    return buildPlainEnglishExplainerResponse(userMessage, history);
  }

  if (isDualWeightMuscleQuery(userMessage)) {
    return buildDualGoalResponse();
  }

  if (isTriedCompoundFollowUp(userMessage, history)) {
    return buildTriedCompoundFollowUpResponse(userMessage, history);
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
        'PepGuide Pro is already unlocked. Open **Education & Research** for video lessons and **Protocols** for goal-built stacks under PepGuide Pro in the sidebar. **Questions & Discussion** is free for everyone below Chat.',
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

  // Only hard-refuse as off-topic when the message has no peptide signal.
  // Legitimate in-scope asks (e.g. "how to get tan" → melanotan) can be
  // mislabeled off_topic by the intent model; keep those in the research lane.
  if (intent.goal === 'off_topic' && !hasInScopeSignal(userMessage)) {
    return withUsage(
      buildRefusalResponse('out_of_scope', 'refuse'),
      intentUsage,
    );
  }
  if (intent.goal === 'off_topic') {
    intent.goal = 'general';
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

  const topicPivot =
    isTopicPivot(userMessage) ||
    isDistinctGoalLane(intent.goal) ||
    intent.goal === 'muscle';
  const turnsForGrounding = topicPivot ? [] : priorTurns;

  const groundingQuery = buildGroundingQuery(
    userMessage,
    `${retrievalQuery} ${intent.keywords.join(' ')}`.trim(),
    turnsForGrounding,
  );

  const apiKey = getOpenAiKey();
  if (!apiKey) {
    return withUsage(
      buildFallbackFromKnowledge(
        userMessage,
        retrievalQuery,
        classification.category,
        turnsForGrounding,
      ),
      intentUsage,
    );
  }

  // On a clear topic change, don't feed the old weight-loss thread into the model.
  const historyForModel = topicPivot
    ? ([
        {
          role: 'user' as const,
          content:
            '[Earlier in this chat the user discussed a different research topic. They have now changed goals — answer ONLY the new question. Do not repeat or recommend compounds from the earlier goal.]',
        },
      ] satisfies ResearchChatTurn[])
    : priorTurns;

  let parsedContent: unknown;
  let usage: TokenUsage | undefined = intentUsage;
  try {
    const client = new OpenAI({ apiKey });
    const systemPrompt = [
      buildSystemPrompt(
        userMessage,
        retrievalQuery,
        turnsForGrounding,
      ),
      '',
      'NORMALIZED USER INTENT (from classifier — follow this goal):',
      `- Goal: ${intent.goal}`,
      `- Summary: ${intent.summary}`,
      `- Keywords: ${intent.keywords.join(', ')}`,
      topicPivot
        ? 'TOPIC PIVOT: Ignore earlier metabolic/GLP-1 context. Answer the current goal only.'
        : '',
    ]
      .filter(Boolean)
      .join('\n');
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
        turnsForGrounding,
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
        turnsForGrounding,
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
