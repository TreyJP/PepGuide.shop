import type { Firestore } from 'firebase-admin/firestore';

import type { AccountStatus, MessageClassification, SafetyAction } from '@/src/types';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_SHORT_MS = 60 * 60 * 1000;
const COOLDOWN_LONG_MS = 24 * 60 * 60 * 1000;

/** Categories that count toward abuse escalation. */
const ABUSE_WEIGHT: Partial<Record<MessageClassification, number>> = {
  out_of_scope: 2,
  spam: 2,
  prompt_injection: 3,
  automated_scraping: 3,
  repeated_policy_circumvention: 3,
  vendor_or_sourcing_request: 2,
  injection_instructions: 2,
  reconstitution_instructions: 2,
  evade_medical_supervision: 2,
  minor_user: 2,
  personalized_dosing_request: 1,
  cycle_or_stack_construction: 1,
  personalized_medical_request: 1,
};

const STRIKE_REVIEW = 2;
const STRIKE_COOLDOWN_SHORT = 3;
const STRIKE_COOLDOWN_LONG = 5;
const STRIKE_SUSPEND = 8;

export type ChatAccessResult =
  | { allowed: true; accountStatus: AccountStatus; chatBlockedUntil: string | null }
  | {
      allowed: false;
      accountStatus: AccountStatus;
      chatBlockedUntil: string | null;
      reason: string;
      code: 'account_suspended' | 'account_cooldown' | 'account_review';
    };

export type AbuseEscalationResult = {
  accountStatus: AccountStatus;
  chatBlockedUntil: string | null;
  abuseStrikeCount: number;
  newlyBlocked: boolean;
};

function parseTime(value: unknown): number | null {
  if (typeof value !== 'string' || !value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

export async function assertChatAccess(
  db: Firestore,
  uid: string,
): Promise<ChatAccessResult> {
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) {
    // Don't block chat when the client profile write hasn't landed yet.
    return {
      allowed: true,
      accountStatus: 'active',
      chatBlockedUntil: null,
    };
  }

  const data = snap.data() ?? {};
  let accountStatus = (data.accountStatus as AccountStatus) ?? 'active';
  let chatBlockedUntil =
    typeof data.chatBlockedUntil === 'string' ? data.chatBlockedUntil : null;
  const blockedUntilMs = parseTime(chatBlockedUntil);
  const now = Date.now();

  // Auto-clear expired cooldowns.
  if (
    accountStatus === 'cooldown' &&
    blockedUntilMs !== null &&
    now >= blockedUntilMs
  ) {
    accountStatus = 'active';
    chatBlockedUntil = null;
    await userRef.set(
      {
        accountStatus: 'active',
        chatBlockedUntil: null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  if (accountStatus === 'suspended') {
    return {
      allowed: false,
      accountStatus,
      chatBlockedUntil,
      reason:
        'Your account has been suspended for repeated PepGuide policy violations. Chat is disabled.',
      code: 'account_suspended',
    };
  }

  if (
    accountStatus === 'cooldown' &&
    blockedUntilMs !== null &&
    now < blockedUntilMs
  ) {
    return {
      allowed: false,
      accountStatus,
      chatBlockedUntil,
      reason:
        'Chat is temporarily locked after repeated out-of-scope or policy-violating requests. Please try again later.',
      code: 'account_cooldown',
    };
  }

  return {
    allowed: true,
    accountStatus,
    chatBlockedUntil,
  };
}

export async function recordSafetyEventAndEscalate(
  db: Firestore,
  input: {
    uid: string;
    chatId: string;
    category: MessageClassification;
    safetyAction: SafetyAction;
  },
): Promise<AbuseEscalationResult | null> {
  const { uid, chatId, category, safetyAction } = input;
  const weight = ABUSE_WEIGHT[category] ?? 0;
  const shouldEscalate =
    (safetyAction === 'refuse' || safetyAction === 'rate_limit') && weight > 0;

  const severity =
    safetyAction === 'urgent_warning'
      ? 'critical'
      : weight >= 3
        ? 'high'
        : weight >= 2
          ? 'medium'
          : 'low';

  await db.collection('safetyEvents').add({
    userId: uid,
    chatId,
    category,
    severity,
    action: safetyAction,
    weight: shouldEscalate ? weight : 0,
    createdAt: new Date().toISOString(),
  });

  if (!shouldEscalate) {
    return null;
  }

  const userRef = db.collection('users').doc(uid);
  const now = Date.now();

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data() ?? {};
    const previousStatus = (data.accountStatus as AccountStatus) ?? 'active';

    if (previousStatus === 'suspended') {
      return {
        accountStatus: 'suspended' as const,
        chatBlockedUntil: null,
        abuseStrikeCount: Number(data.abuseStrikeCount ?? 0),
        newlyBlocked: false,
      };
    }

    let windowStart = parseTime(data.abuseWindowStartedAt) ?? now;
    let strikes = Number(data.abuseStrikeCount ?? 0);

    if (now - windowStart > WINDOW_MS) {
      windowStart = now;
      strikes = 0;
    }

    strikes += weight;

    let accountStatus: AccountStatus = previousStatus;
    let chatBlockedUntil =
      typeof data.chatBlockedUntil === 'string' ? data.chatBlockedUntil : null;
    let newlyBlocked = false;

    if (strikes >= STRIKE_SUSPEND) {
      accountStatus = 'suspended';
      chatBlockedUntil = null;
      newlyBlocked = true;
    } else if (strikes >= STRIKE_COOLDOWN_LONG) {
      accountStatus = 'cooldown';
      chatBlockedUntil = new Date(now + COOLDOWN_LONG_MS).toISOString();
      newlyBlocked = true;
    } else if (strikes >= STRIKE_COOLDOWN_SHORT) {
      accountStatus = 'cooldown';
      chatBlockedUntil = new Date(now + COOLDOWN_SHORT_MS).toISOString();
      newlyBlocked = previousStatus !== 'cooldown';
    } else if (strikes >= STRIKE_REVIEW) {
      accountStatus = 'review';
    }

    tx.set(
      userRef,
      {
        abuseStrikeCount: strikes,
        abuseWindowStartedAt: new Date(windowStart).toISOString(),
        accountStatus,
        chatBlockedUntil,
        lastAbuseAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      },
      { merge: true },
    );

    return {
      accountStatus,
      chatBlockedUntil,
      abuseStrikeCount: strikes,
      newlyBlocked,
    };
  });
}

export function blockedAccountResponse(input: {
  reason: string;
  code: string;
  accountStatus: AccountStatus;
  chatBlockedUntil: string | null;
}) {
  return {
    answer: input.reason,
    classification: 'repeated_policy_circumvention' as const,
    safetyAction: 'rate_limit' as const,
    evidenceCards: [],
    citations: [],
    suggestedQuestions: [
      'Which peptides are researched for metabolic health?',
      'What does PepGuide cover?',
    ],
    peptideIds: [] as string[],
    moderation: {
      code: input.code,
      accountStatus: input.accountStatus,
      chatBlockedUntil: input.chatBlockedUntil,
    },
  };
}
