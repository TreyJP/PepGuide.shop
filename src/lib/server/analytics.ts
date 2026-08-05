import type { Firestore } from 'firebase-admin/firestore';

import type { AnalyticsEventName } from '@/src/types/analytics';

export async function recordAnalyticsEventAdmin(
  db: Firestore,
  input: {
    name: AnalyticsEventName;
    userId?: string | null;
    email?: string | null;
    path?: string | null;
    meta?: Record<string, string | number | boolean | null>;
  },
): Promise<void> {
  const createdAt = new Date().toISOString();
  await db.collection('analyticsEvents').add({
    name: input.name,
    createdAt,
    userId: input.userId ?? null,
    email: input.email ?? null,
    path: input.path ?? null,
    meta: input.meta ?? {},
  });
}
