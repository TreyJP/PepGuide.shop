import type { AccountStatus, MessageClassification } from '@/src/types';

import type { AbuseEscalationResult } from '@/src/lib/server/abuse';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_SHORT_MS = 60 * 60 * 1000;
const COOLDOWN_LONG_MS = 24 * 60 * 60 * 1000;

/** Soft off-topic does not strike — focus on spam / jailbreak abuse. */
const WEIGHT: Partial<Record<MessageClassification, number>> = {
  spam: 2,
  prompt_injection: 3,
  repeated_policy_circumvention: 3,
};

const STRIKE_REVIEW = 2;
/** Lock after 3 off-topic (weight-1) refusals in the window. */
const STRIKE_COOLDOWN_SHORT = 3;
const STRIKE_COOLDOWN_LONG = 5;
const STRIKE_SUSPEND = 8;

type StrikeState = {
  count: number;
  windowStart: number;
  accountStatus: AccountStatus;
  blockedUntil: number | null;
};

/** In-memory fallback when Firebase Admin isn’t configured. */
const memoryStrikes = new Map<string, StrikeState>();

export function getMemoryChatBlock(uid: string): {
  blocked: boolean;
  reason?: string;
  accountStatus: AccountStatus;
  chatBlockedUntil: string | null;
} {
  const state = memoryStrikes.get(uid);
  if (!state) {
    return {
      blocked: false,
      accountStatus: 'active',
      chatBlockedUntil: null,
    };
  }

  const now = Date.now();
  if (
    state.accountStatus === 'cooldown' &&
    state.blockedUntil !== null &&
    now >= state.blockedUntil
  ) {
    state.accountStatus = 'active';
    state.blockedUntil = null;
  }

  if (state.accountStatus === 'suspended') {
    return {
      blocked: true,
      reason:
        'Your account has been suspended for repeated PepGuide policy violations. Chat is disabled.',
      accountStatus: 'suspended',
      chatBlockedUntil: null,
    };
  }

  if (
    state.accountStatus === 'cooldown' &&
    state.blockedUntil !== null &&
    now < state.blockedUntil
  ) {
    return {
      blocked: true,
      reason:
        'Chat is temporarily locked after repeated out-of-scope requests. Please return later with a peptide research question.',
      accountStatus: 'cooldown',
      chatBlockedUntil: new Date(state.blockedUntil).toISOString(),
    };
  }

  return {
    blocked: false,
    accountStatus: state.accountStatus,
    chatBlockedUntil: null,
  };
}

export function recordMemoryScopeStrike(
  uid: string,
  category: MessageClassification,
): AbuseEscalationResult | null {
  const weight = WEIGHT[category] ?? 0;
  if (weight <= 0) return null;

  const now = Date.now();
  const existing = memoryStrikes.get(uid);
  let windowStart = existing?.windowStart ?? now;
  let count = existing?.count ?? 0;
  let previousStatus = existing?.accountStatus ?? 'active';

  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    count = 0;
    previousStatus = 'active';
  }

  if (previousStatus === 'suspended') {
    return {
      accountStatus: 'suspended',
      chatBlockedUntil: null,
      abuseStrikeCount: count,
      newlyBlocked: false,
    };
  }

  count += weight;

  let accountStatus: AccountStatus = previousStatus;
  let blockedUntil: number | null = existing?.blockedUntil ?? null;
  let newlyBlocked = false;

  if (count >= STRIKE_SUSPEND) {
    accountStatus = 'suspended';
    blockedUntil = null;
    newlyBlocked = true;
  } else if (count >= STRIKE_COOLDOWN_LONG) {
    accountStatus = 'cooldown';
    blockedUntil = now + COOLDOWN_LONG_MS;
    newlyBlocked = true;
  } else if (count >= STRIKE_COOLDOWN_SHORT) {
    accountStatus = 'cooldown';
    blockedUntil = now + COOLDOWN_SHORT_MS;
    newlyBlocked = previousStatus !== 'cooldown';
  } else if (count >= STRIKE_REVIEW) {
    accountStatus = 'review';
  }

  memoryStrikes.set(uid, {
    count,
    windowStart,
    accountStatus,
    blockedUntil,
  });

  return {
    accountStatus,
    chatBlockedUntil:
      blockedUntil !== null ? new Date(blockedUntil).toISOString() : null,
    abuseStrikeCount: count,
    newlyBlocked,
  };
}

export function scopeWarningForStrikes(strikes: number): string | null {
  if (strikes >= STRIKE_COOLDOWN_SHORT) return null;
  const remaining = Math.max(0, STRIKE_COOLDOWN_SHORT - strikes);
  if (remaining === 1) {
    return '1 abuse warning left before chat is locked for 1 hour.';
  }
  if (remaining > 0) {
    return `${remaining} abuse warnings left before chat is locked for 1 hour.`;
  }
  return null;
}
