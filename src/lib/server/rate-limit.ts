import type { Firestore } from 'firebase-admin/firestore';

export const RATE_LIMITS = {
  maxInputChars: 4000,
  perMinute: 6,
  perHour: 60,
  perDay: 200,
  /** Soft daily token budget (prompt + completion). */
  perDayTokens: 100_000,
  /** Higher budget for Pro / admin. */
  perDayTokensPro: 300_000,
} as const;

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export type TokenUsageDelta = {
  inputTokens: number;
  outputTokens: number;
};

type PeriodUsage = {
  messagesUsed: number;
  inputTokens: number;
  outputTokens: number;
  recentTimestamps: number[];
};

/** In-memory fallback when Firebase Admin isn’t configured. */
const memoryPeriods = new Map<string, PeriodUsage & { day: string }>();

function todayId(): string {
  return new Date().toISOString().slice(0, 10);
}

function memoryKey(uid: string): string {
  return `${uid}:${todayId()}`;
}

function getMemoryPeriod(uid: string): PeriodUsage & { day: string } {
  const day = todayId();
  const key = memoryKey(uid);
  const existing = memoryPeriods.get(key);
  if (existing && existing.day === day) return existing;
  const fresh = {
    day,
    messagesUsed: 0,
    inputTokens: 0,
    outputTokens: 0,
    recentTimestamps: [] as number[],
  };
  memoryPeriods.set(key, fresh);
  return fresh;
}

function dailyTokenLimit(isPro: boolean): number {
  return isPro ? RATE_LIMITS.perDayTokensPro : RATE_LIMITS.perDayTokens;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

function assertUnderBudget(
  data: PeriodUsage,
  content: string,
  isPro: boolean,
): void {
  const now = Date.now();
  const recent = (data.recentTimestamps ?? []).filter(
    (ts) => now - ts < 60 * 60 * 1000,
  );
  const lastMinute = recent.filter((ts) => now - ts < 60 * 1000);

  if (content.length > RATE_LIMITS.maxInputChars) {
    throw new RateLimitError('Message exceeds maximum length.');
  }
  if (lastMinute.length >= RATE_LIMITS.perMinute) {
    throw new RateLimitError(
      'You’re sending messages too quickly. Wait a minute and try again.',
    );
  }
  if (recent.length >= RATE_LIMITS.perHour) {
    throw new RateLimitError(
      'Hourly chat limit reached. Please try again later.',
    );
  }
  if ((data.messagesUsed ?? 0) >= RATE_LIMITS.perDay) {
    throw new RateLimitError(
      'Daily chat limit reached. Please try again tomorrow.',
    );
  }

  const usedTokens =
    (data.inputTokens ?? 0) + (data.outputTokens ?? 0);
  const limit = dailyTokenLimit(isPro);
  const estimatedNext = estimateTokens(content);
  if (usedTokens + estimatedNext > limit) {
    throw new RateLimitError(
      'Daily research token budget reached. Please try again tomorrow.',
    );
  }
}

export async function enforceRateLimits(
  db: Firestore,
  uid: string,
  content: string,
  options: { isPro?: boolean } = {},
): Promise<void> {
  const isPro = Boolean(options.isPro);
  const now = Date.now();
  const periodId = todayId();
  const usageRef = db
    .collection('usage')
    .doc(uid)
    .collection('periods')
    .doc(periodId);
  const snap = await usageRef.get();
  const data = {
    messagesUsed: Number(snap.data()?.messagesUsed ?? 0),
    inputTokens: Number(snap.data()?.inputTokens ?? 0),
    outputTokens: Number(snap.data()?.outputTokens ?? 0),
    recentTimestamps: (snap.data()?.recentTimestamps as number[]) ?? [],
  };

  assertUnderBudget(data, content, isPro);

  const recent = data.recentTimestamps.filter(
    (ts) => now - ts < 60 * 60 * 1000,
  );

  await usageRef.set(
    {
      messagesUsed: data.messagesUsed + 1,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      recentTimestamps: [...recent, now].slice(-RATE_LIMITS.perHour),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/** Memory-only rate + token gate when Admin Firestore isn’t available. */
export function enforceMemoryRateLimits(
  uid: string,
  content: string,
  options: { isPro?: boolean } = {},
): void {
  const isPro = Boolean(options.isPro);
  const period = getMemoryPeriod(uid);
  assertUnderBudget(period, content, isPro);

  const now = Date.now();
  period.messagesUsed += 1;
  period.recentTimestamps = [...period.recentTimestamps, now]
    .filter((ts) => now - ts < 60 * 60 * 1000)
    .slice(-RATE_LIMITS.perHour);
}

export async function recordTokenUsage(
  db: Firestore,
  uid: string,
  usage: TokenUsageDelta,
): Promise<void> {
  const inputTokens = Math.max(0, Math.round(usage.inputTokens));
  const outputTokens = Math.max(0, Math.round(usage.outputTokens));
  if (inputTokens === 0 && outputTokens === 0) return;

  const usageRef = db
    .collection('usage')
    .doc(uid)
    .collection('periods')
    .doc(todayId());
  const snap = await usageRef.get();
  const current = snap.data() ?? {};

  await usageRef.set(
    {
      inputTokens: Number(current.inputTokens ?? 0) + inputTokens,
      outputTokens: Number(current.outputTokens ?? 0) + outputTokens,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export function recordMemoryTokenUsage(
  uid: string,
  usage: TokenUsageDelta,
): void {
  const period = getMemoryPeriod(uid);
  period.inputTokens += Math.max(0, Math.round(usage.inputTokens));
  period.outputTokens += Math.max(0, Math.round(usage.outputTokens));
}
