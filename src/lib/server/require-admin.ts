import { isEnvAdminEmail } from '@/src/lib/admin';
import {
  tryGetAdminDb,
  verifyBearerToken,
  type VerifiedUser,
} from '@/src/lib/server/firebase-admin';

/** Verifies the caller is an admin (env list or Firestore allowlist). */
export async function requireAdminUser(
  request: Request,
): Promise<VerifiedUser> {
  const user = await verifyBearerToken(request);
  if (isEnvAdminEmail(user.email)) return user;

  const email = user.email?.trim().toLowerCase();
  if (!email) {
    throw new Error('Admin access required.');
  }

  const db = tryGetAdminDb();
  if (!db) {
    throw new Error('Admin access required.');
  }

  const snap = await db.collection('config').doc('admins').get();
  const emails = Array.isArray(snap.data()?.emails)
    ? (snap.data()?.emails as unknown[]).map((item) =>
        String(item).trim().toLowerCase(),
      )
    : [];

  if (!emails.includes(email)) {
    throw new Error('Admin access required.');
  }

  return user;
}
