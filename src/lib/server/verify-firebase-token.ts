/**
 * Firebase ID token verification via Identity Toolkit REST.
 * Intentionally avoids firebase-admin / jwks-rsa / jose — those crash on
 * Vercel Node with ERR_REQUIRE_ESM and take down /api/research/message.
 */

export type VerifiedUser = {
  uid: string;
  email?: string;
};

export async function verifyIdTokenViaRest(
  idToken: string,
): Promise<VerifiedUser> {
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

  return verifyIdTokenViaRest(match[1]);
}
