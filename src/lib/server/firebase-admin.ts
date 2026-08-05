import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import {
  verifyBearerToken as verifyBearerTokenRest,
  type VerifiedUser,
} from '@/src/lib/server/verify-firebase-token';

export type { VerifiedUser };

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes('fill_me') ||
    normalized.includes('xxxxx') ||
    normalized.includes('...') ||
    normalized.includes('your_') ||
    normalized.includes('example')
  );
}

export function isFirebaseAdminConfigured(): boolean {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n',
  );

  if (!projectId || !clientEmail || !privateKey) return false;
  if (looksLikePlaceholder(clientEmail) || looksLikePlaceholder(privateKey)) {
    return false;
  }
  if (!privateKey.includes('BEGIN PRIVATE KEY')) return false;

  return true;
}

/** Safe Admin Firestore accessor — null when unset/placeholder/broken. */
export function tryGetAdminDb() {
  if (!isFirebaseAdminConfigured()) return null;
  try {
    return getAdminDb();
  } catch (error) {
    console.error('Firebase Admin DB init failed', error);
    return null;
  }
}

function initAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n',
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.',
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminDb() {
  return getFirestore(initAdminApp());
}

/** REST-only — never uses firebase-admin Auth / jwks-rsa / jose. */
export async function verifyBearerToken(
  request: Request,
): Promise<VerifiedUser> {
  return verifyBearerTokenRest(request);
}

export async function setUserSubscriptionTier(
  uid: string,
  tier: 'free' | 'pro',
  extra?: Record<string, unknown>,
) {
  await getAdminDb()
    .collection('users')
    .doc(uid)
    .set(
      {
        subscriptionTier: tier,
        ...extra,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
}
