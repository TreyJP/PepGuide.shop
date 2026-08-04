import type { Firestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

const MAX_INPUT = 4000;
const PER_MINUTE = 6;
const PER_HOUR = 60;
const PER_DAY = 200;

export async function enforceRateLimits(
  db: Firestore,
  uid: string,
  content: string,
): Promise<void> {
  if (content.length > MAX_INPUT) {
    throw new HttpsError('invalid-argument', 'Message exceeds maximum length.');
  }

  const now = Date.now();
  const periodId = new Date().toISOString().slice(0, 10);
  const usageRef = db.collection('usage').doc(uid).collection('periods').doc(periodId);
  const snap = await usageRef.get();
  const data = snap.data() ?? {
    messagesUsed: 0,
    recentTimestamps: [] as number[],
  };

  const recent = ((data.recentTimestamps as number[]) ?? []).filter(
    (ts) => now - ts < 60 * 60 * 1000,
  );
  const lastMinute = recent.filter((ts) => now - ts < 60 * 1000);
  if (lastMinute.length >= PER_MINUTE) {
    throw new HttpsError('resource-exhausted', 'Per-minute limit reached.');
  }
  if (recent.length >= PER_HOUR) {
    throw new HttpsError('resource-exhausted', 'Hourly limit reached.');
  }
  if ((data.messagesUsed as number) >= PER_DAY) {
    throw new HttpsError('resource-exhausted', 'Daily limit reached.');
  }

  await usageRef.set(
    {
      messagesUsed: ((data.messagesUsed as number) ?? 0) + 1,
      recentTimestamps: [...recent, now].slice(-PER_HOUR),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
