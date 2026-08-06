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
import { pepGuideResponseSchema } from '@/src/schemas/ai';
import type { PepGuideAiResponse } from '@/src/types';

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
    'That’s outside PepGuide’s scope. Please ask a question relevant to peptides — compounds, mechanisms, evidence, or research dosing ranges.\n\nRepeated off-topic messages can temporarily lock chat.',
  out_of_scope:
    'That’s outside PepGuide’s scope. Please return to peptide research — compounds, mechanisms, evidence, regulatory context, or research dosing ranges.\n\nRepeated off-topic messages can temporarily lock chat.',
  minor_user:
    'PepGuide is only for adults. If you are under 18, please stop and talk with a parent/guardian and a clinician.',
  acute_adverse_event:
    'If you may be having a medical emergency, seek emergency care immediately or contact local emergency services. I can’t provide emergency medical treatment advice.',
  repeated_policy_circumvention:
    'Repeated requests outside PepGuide’s research boundaries aren’t allowed. Chat may be temporarily locked if this continues.',
};

function isWeightLossQuery(text: string): boolean {
  return /\b(weight|lose|loss|fat|obesity|obese|glp-?1|incretin|retatrutide|semaglutide|tirzepatide|slim|appetite|hunger|hungry|satiety|craving)\b/i.test(
    text,
  );
}

function isMuscleQuery(text: string): boolean {
  return /\b(muscle|hypertrophy|anabolic|lean mass|build muscle|gain(?:ing)? muscle|muscle gain|gains?|secretagogue|growth hormone|\bgh\b|igf(?:-?1)?|ipamorelin|cjc|sermorelin)\b/i.test(
    text,
  );
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
    'FORMATTING RULES FOR answer:',
    '- Keep answers SHORT. Default max ~120–180 words unless the user asks for depth.',
    '- Use clean Markdown: short bullets, minimal bold, no long essays.',
    '- No multi-paragraph intros, no repeated disclaimers, no filler.',
    '- Prefer 4–8 tight bullets over paragraphs.',
    'CONVERSATION RULES:',
    '- Prioritize the CURRENT user question over older turns.',
    '- If the user pivots to a new research goal (e.g. muscle after weight loss), answer that new goal.',
    '- Do NOT keep recommending weight-loss / GLP-1 compounds unless the user asks to combine goals.',
    '- Use prior turns only when the user is clearly continuing the same topic.',
    '- Stay educational / research framing — compare mechanisms and evidence, do not prescribe a personal protocol.',
    dualQuery
      ? [
          'DUAL GOAL ANSWER RULES (strict — weight loss + muscle):',
          '- User asked for BOTH fat/weight loss AND muscle / lean-mass research.',
          '- Recommend exactly ONE primary metabolic / weight-loss peptide (prefer retatrutide) AND exactly ONE primary muscle peptide (prefer ipamorelin).',
          '- Structure the answer with two clear headings: **Weight loss** and **Muscle / lean mass**.',
          '- Briefly note they address different pathways — not a personal combined protocol.',
          '- peptideIds MUST start with those two primaries, then optional extras from each category.',
          '- Do NOT collapse into a weight-only or muscle-only list.',
        ].join('\n')
      : muscleQuery
        ? [
            'MUSCLE / LEAN-MASS ANSWER RULES (strict):',
            '- Focus on GH secretagogue / muscle-research PEPTIDES only (e.g. ipamorelin, CJC-1295, sermorelin, IGF analogs).',
            '- Do NOT recommend retatrutide, tirzepatide, semaglutide, or other weight-loss incretins unless the user explicitly asks about both goals.',
            '- Cover evidence quality and key risks briefly.',
            '- Include peptideIds for the top muscle-relevant peptides discussed.',
          ].join('\n')
        : appetiteFollowUp
          ? [
              'APPETITE / COMPLEMENT FOLLOW-UP RULES (strict):',
              '- User still has hunger/appetite concerns on an incretin (e.g. retatrutide).',
              '- Recommend researched complementary PEPTIDES that target appetite/satiety via a different pathway (prefer amylin: cagrilintide; also amycretin).',
              '- Explain briefly WHY it can add appetite suppression on top of a GLP-1/triple agonist (different satiety pathway).',
              '- Include 1–2 peptideIds for the best complements (cagrilintide first).',
              '- Do NOT re-list retatrutide/tirzepatide/semaglutide as the main answer unless comparing.',
              '- One short research-only disclaimer.',
            ].join('\n')
          : weightQuery
            ? [
                'WEIGHT-LOSS ANSWER RULES:',
                '- Talk ONLY about weight-loss / obesity / metabolic PEPTIDES.',
                '- Do NOT mention hair, healing, cosmetic, sexual, sleep, or unrelated peptides.',
                '- Prefer peptides from the knowledge context / dosing guide.',
              ].join('\n')
            : '',
    'CONTENT RULES:',
    '- PEPTIDES ONLY: never recommend or list non-peptides (no MK-677, orforglipron, tesofensine, tadalafil, SR9009, noopept, small molecules, etc.).',
    '- Use ONLY peptides from the knowledge context / dosing guide.',
    '- When recommending peptides, reference their Main effects from the knowledge context.',
    '- Always return peptideIds for the peptides you recommend (include up to 6–8 relevant peptides when several fit) so the UI can show dosing/price cards and a View more list.',
    '- Stay on the user’s CURRENT research goal; do not drift to unrelated categories.',
    '- Research dosing: start low, increase only if effects are still limited.',
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

function buildWeightLossPicksResponse(): PepGuideAiResponse {
  const peptideIds = getWeightLossGuideIds(8);
  const cardSource = peptideIds
    .map((id) => getCompoundById(id))
    .filter((compound): compound is NonNullable<typeof compound> => Boolean(compound));

  return pepGuideResponseSchema.parse({
    answer: PICKS_ONLY_ANSWER,
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
    suggestedQuestions: [
      'I tried retatrutide but still feel hungry — what complements appetite research?',
      'How does cagrilintide differ from GLP-1 agonists?',
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
      'You’re aiming at **two research goals** — here’s one strong option for each (educational only, not a personal protocol):',
      '',
      '**Weight loss**',
      weight
        ? `- **${weight.name}** — ${weight.summary}`
        : '- **Retatrutide** — leading metabolic / fat-loss research signal.',
      '',
      '**Muscle / lean mass**',
      muscle
        ? `- **${muscle.name}** — ${muscle.summary}`
        : '- **Ipamorelin** — selective GH secretagogue often discussed for lean-mass research.',
      '',
      'Different pathways — combining them is not a prescription. Use the dosing cards below for research ranges and partner prices.',
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
      `Since appetite is still an issue on **${triedLabel}**, research often looks at a **different satiety pathway** rather than swapping the whole incretin.`,
      '',
      primary
        ? `- **${primary.name}** — ${primary.summary} Researchers have studied amylin agonism alone and with GLP-1s (e.g. CagriSema) for added appetite/satiety effect.`
        : '',
      secondary
        ? `- **${secondary.name}** — ${secondary.summary}`
        : '',
      '- Educational framing only — not a personal stack or prescription. Ask a clinician before combining agents.',
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
    return buildWeightLossPicksResponse();
  }

  if (
    !isMuscleQuery(userMessage) &&
    (isAppetiteComplementQuery(userMessage) || isMetabolicFollowUp(userMessage))
  ) {
    return buildAppetiteComplementResponse(userMessage, history);
  }

  if (isMuscleQuery(userMessage) && !isWeightLossQuery(userMessage)) {
    const peptideIds = getMuscleTopIds(6);
    const compounds = peptideIds
      .map((id) => getCompoundById(id))
      .filter((compound): compound is NonNullable<typeof compound> => Boolean(compound));

    return pepGuideResponseSchema.parse({
      answer: [
        'For muscle / lean-mass research, these GH-axis options come up most often (educational only — not a personal protocol):',
        '',
        ...compounds.map(
          (compound) => `- **${compound.name}** — ${compound.summary}`,
        ),
        '',
        'Click a dosing card below to compare partner price slots.',
      ].join('\n'),
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
        'How do ipamorelin and CJC-1295 differ?',
        'What are the main risks of IGF-1 LR3?',
      ],
      peptideIds,
    });
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
      'Based on PepGuide’s research knowledge base, here is an educational overview. This is not a personal treatment recommendation.',
      '',
      '## Relevant compounds',
      '',
      ...compounds.map(
        (compound) =>
          `- **${compound.name}** — ${compound.summary}\n  - Evidence: ${compound.humanEvidenceGrade.replace(/_/g, ' ')}\n  - Regulatory: ${compound.regulatoryDetail ?? compound.regulatoryStatus.replace(/_/g, ' ')}`,
      ),
      '',
      'I can go deeper on mechanisms, evidence quality, or research dosing ranges for any of these.',
    ].join('\n'),
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
        'Guides and Protocols are already unlocked with your PepGuide Pro access. Open **Guides** for Skool-style video lessons by level, or **Protocols** for goal-built peptide stacks — both are in the PepGuide Pro section of the sidebar.',
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
): Promise<PepGuideAiResponse> {
  const priorTurns = normalizeHistory(history);
  const classification = classifyMessage(userMessage);

  if (
    classification.category === 'pro_content_inquiry' ||
    isProContentInquiry(userMessage)
  ) {
    return buildProUnlockResponse(Boolean(options.isPro));
  }

  if (
    classification.safetyAction === 'refuse' ||
    classification.safetyAction === 'urgent_warning'
  ) {
    // Soft redirect: dual goals / weight discovery still get educational picks.
    if (
      (classification.category === 'personalized_dosing_request' ||
        classification.category === 'cycle_or_stack_construction') &&
      isDualWeightMuscleQuery(userMessage)
    ) {
      return buildDualGoalResponse();
    }
    if (
      classification.category === 'personalized_dosing_request' &&
      shouldReturnWeightLossPicks(userMessage, priorTurns)
    ) {
      return buildWeightLossPicksResponse();
    }
    if (
      classification.category === 'personalized_dosing_request' &&
      (isAppetiteComplementQuery(userMessage) || isMetabolicFollowUp(userMessage))
    ) {
      return buildFallbackFromKnowledge(
        userMessage,
        classification.retrievalQuery,
        'research_goal_exploration',
        priorTurns,
      );
    }
    return buildRefusalResponse(
      classification.category,
      classification.safetyAction,
    );
  }

  const retrievalQuery = classification.retrievalQuery;

  // Dual goals: one metabolic pick + one muscle pick (with dosing cards).
  if (isDualWeightMuscleQuery(userMessage)) {
    return buildDualGoalResponse();
  }

  // Weight/fat-loss discovery: compact top 3 picks UI (including mid-chat).
  if (shouldReturnWeightLossPicks(userMessage, priorTurns)) {
    return buildWeightLossPicksResponse();
  }

  const groundingQuery = buildGroundingQuery(
    userMessage,
    retrievalQuery,
    priorTurns,
  );

  const apiKey = getOpenAiKey();
  if (!apiKey) {
    return buildFallbackFromKnowledge(
      userMessage,
      retrievalQuery,
      classification.category,
      priorTurns,
    );
  }

  const topicPivot = isTopicPivot(userMessage);
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
  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: PEP_GUIDE_MODEL,
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(userMessage, retrievalQuery, priorTurns),
        },
        ...historyForModel.map((turn) => ({
          role: turn.role as 'user' | 'assistant',
          content: turn.content,
        })),
        { role: 'user', content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return buildFallbackFromKnowledge(
        userMessage,
        retrievalQuery,
        classification.category,
        priorTurns,
      );
    }
    parsedContent = JSON.parse(content);
  } catch (error) {
    console.error('OpenAI research generation failed', error);
    return buildFallbackFromKnowledge(
      userMessage,
      retrievalQuery,
      classification.category,
      priorTurns,
    );
  }

  const parsed = pepGuideResponseSchema.safeParse(parsedContent);
  if (!parsed.success) {
    return buildFallbackFromKnowledge(
      userMessage,
      retrievalQuery,
      classification.category,
      priorTurns,
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
    };
  }

  return {
    ...parsed.data,
    classification: classification.category,
    peptideIds: filterPeptideIds(forcedIds ?? modelIds),
    evidenceCards: parsed.data.evidenceCards.filter((card) =>
      isPeptideCompoundCard(card.peptideId),
    ),
  };
}

function isPeptideCompoundCard(id: string): boolean {
  return Boolean(getCompoundById(id)?.isPeptide);
}
