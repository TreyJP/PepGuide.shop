import { isEnvAdminEmail } from '@/src/lib/admin';
import {
  tryGetAdminDb,
  verifyBearerToken,
  type VerifiedUser,
} from '@/src/lib/server/firebase-admin';

/** Read custom claims from a token already verified by Identity Toolkit. */
function readVerifiedTokenClaims(
  idToken: string,
): Record<string, unknown> {
  try {
    const payload = idToken.split('.')[1];
    if (!payload) return {};
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

/** Verifies the caller is an admin (env list, token claim, or Firestore allowlist). */
export async function requireAdminUser(
  request: Request,
): Promise<VerifiedUser> {
  const user = await verifyBearerToken(request);
  if (isEnvAdminEmail(user.email)) return user;

  const token = getBearerToken(request);
  if (token) {
    const claims = readVerifiedTokenClaims(token);
    if (claims.admin === true) return user;
  }

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
