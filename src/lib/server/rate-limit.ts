import type { Firestore } from 'firebase-admin/firestore';

export const RATE_LIMITS = {
  maxInputChars: 4000,
  perMinute: 6,
  perHour: 60,
  perDay: 200,
} as const;

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function enforceRateLimits(
  db: Firestore,
  uid: string,
  content: string,
): Promise<void> {
  if (content.length > RATE_LIMITS.maxInputChars) {
    throw new RateLimitError('Message exceeds maximum length.');
  }

  const now = Date.now();
  const periodId = new Date().toISOString().slice(0, 10);
  const usageRef = db
    .collection('usage')
    .doc(uid)
    .collection('periods')
    .doc(periodId);
  const snap = await usageRef.get();
  const data = snap.data() ?? {
    messagesUsed: 0,
    recentTimestamps: [] as number[],
  };

  const recent = ((data.recentTimestamps as number[]) ?? []).filter(
    (ts) => now - ts < 60 * 60 * 1000,
  );
  const lastMinute = recent.filter((ts) => now - ts < 60 * 1000);

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
  if ((data.messagesUsed as number) >= RATE_LIMITS.perDay) {
    throw new RateLimitError(
      'Daily chat limit reached. Please try again tomorrow.',
    );
  }

  await usageRef.set(
    {
      messagesUsed: ((data.messagesUsed as number) ?? 0) + 1,
      recentTimestamps: [...recent, now].slice(-RATE_LIMITS.perHour),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
