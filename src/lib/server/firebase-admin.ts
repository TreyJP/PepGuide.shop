import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function isFirebaseAdminConfigured(): boolean {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    '\n',
  );
  return Boolean(projectId && clientEmail && privateKey);
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

export function getAdminAuth() {
  return getAuth(initAdminApp());
}

export function getAdminDb() {
  return getFirestore(initAdminApp());
}

export type VerifiedUser = {
  uid: string;
  email?: string;
};

/**
 * Verify a Firebase ID token via Identity Toolkit when Admin SDK keys
 * are not configured (common in local/dev).
 */
async function verifyIdTokenViaRest(idToken: string): Promise<VerifiedUser> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Firebase API key is not configured.');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );

  const data = (await response.json()) as {
    error?: { message?: string };
    users?: Array<{ localId?: string; email?: string }>;
  };

  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? 'Invalid or expired auth token.');
  }

  const uid = data.users?.[0]?.localId;
  if (!uid) {
    throw new Error('Auth token did not resolve to a user.');
  }

  return {
    uid,
    email: data.users?.[0]?.email,
  };
}

export async function verifyBearerToken(
  request: Request,
): Promise<VerifiedUser> {
  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    throw new Error('Missing auth token.');
  }

  const idToken = match[1];

  if (isFirebaseAdminConfigured()) {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email,
    };
  }

  return verifyIdTokenViaRest(idToken);
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
