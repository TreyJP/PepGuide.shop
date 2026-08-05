import { NextResponse } from 'next/server';
import { z } from 'zod';

import { isEnvAdminEmail } from '@/src/lib/admin';
import { generateResearchResponse } from '@/src/lib/server/openai';
import { verifyBearerToken } from '@/src/lib/server/verify-firebase-token';
import { pepGuideResponseSchema } from '@/src/schemas/ai';

const turnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const bodySchema = z.object({
  chatId: z.string().min(1),
  content: z.string().min(1).max(4000),
  history: z.array(turnSchema).max(20).optional(),
  isPro: z.boolean().optional(),
});

function adminEnvLooksReady(): boolean {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() ?? '';
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim() ?? '';
  if (!clientEmail || !privateKey) return false;
  const blob = `${clientEmail}\n${privateKey}`.toLowerCase();
  if (
    blob.includes('fill_me') ||
    blob.includes('xxxxx') ||
    blob.includes('...')
  ) {
    return false;
  }
  return privateKey.includes('BEGIN PRIVATE KEY');
}

export async function POST(request: Request) {
  try {
    let uid: string;
    let email: string | undefined;
    try {
      const decoded = await verifyBearerToken(request);
      uid = decoded.uid;
      email = decoded.email;
    } catch (error) {
      console.error('Research auth failed', error);
      const detail =
        error instanceof Error ? error.message : 'Invalid or missing auth token.';
      return NextResponse.json(
        {
          error: 'Sign in required to chat with PepGuide.',
          code: 'unauthenticated',
          detail,
        },
        { status: 401 },
      );
    }

    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload.', code: 'invalid_payload' },
        { status: 400 },
      );
    }

    let isPro = Boolean(parsed.data.isPro);
    // Lazy-load Admin SDK only when real credentials exist — never pull
    // jwks-rsa/jose into the chat path when Admin is unset/placeholder.
    let adminReady = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let db: any = null;

    if (adminEnvLooksReady()) {
      try {
        const admin = await import('@/src/lib/server/firebase-admin');
        const abuse = await import('@/src/lib/server/abuse');
        const rateLimit = await import('@/src/lib/server/rate-limit');

        db = admin.tryGetAdminDb();
        adminReady = Boolean(db) && admin.isFirebaseAdminConfigured();

        if (adminReady && db) {
          const access = await abuse.assertChatAccess(db, uid);
          if (!access.allowed) {
            if (
              access.code === 'account_suspended' &&
              access.reason.includes('missing')
            ) {
              console.warn(
                'User profile missing for chat; continuing without admin gates',
                uid,
              );
            } else {
              const blocked = abuse.blockedAccountResponse({
                reason: access.reason,
                code: access.code,
                accountStatus: access.accountStatus,
                chatBlockedUntil: access.chatBlockedUntil,
              });
              return NextResponse.json(blocked, { status: 403 });
            }
          }

          try {
            await rateLimit.enforceRateLimits(db, uid, parsed.data.content);
          } catch (error) {
            if (error instanceof rateLimit.RateLimitError) {
              const limited = pepGuideResponseSchema.parse({
                answer: error.message,
                classification: 'spam',
                safetyAction: 'rate_limit',
                evidenceCards: [],
                citations: [],
                suggestedQuestions: [],
                peptideIds: [],
              });
              return NextResponse.json(limited, { status: 429 });
            }
            console.error('Rate limit check failed; continuing', error);
          }

          try {
            const userSnap = await db.collection('users').doc(uid).get();
            const userEmail =
              email?.toLowerCase() ||
              String(userSnap.data()?.email ?? '').toLowerCase() ||
              null;
            let isAdminUser = isEnvAdminEmail(userEmail);
            if (!isAdminUser && userEmail) {
              const adminsSnap = await db
                .collection('config')
                .doc('admins')
                .get();
              const emails = adminsSnap.data()?.emails;
              isAdminUser =
                Array.isArray(emails) &&
                emails
                  .map((item) => String(item).toLowerCase())
                  .includes(userEmail);
            }
            isPro =
              userSnap.data()?.subscriptionTier === 'pro' || isAdminUser;
          } catch (error) {
            console.error('Pro status lookup failed; continuing as free', error);
          }
        }
      } catch (error) {
        console.error(
          'Firebase Admin optional path failed; continuing without it',
          error,
        );
        adminReady = false;
        db = null;
      }
    }

    let response;
    try {
      response = await generateResearchResponse(
        parsed.data.content,
        parsed.data.history ?? [],
        { isPro },
      );
    } catch (error) {
      console.error('generateResearchResponse threw', error);
      const detail =
        error instanceof Error ? error.message : 'Unknown generation error';
      return NextResponse.json(
        {
          error: `Unable to generate a research response. ${detail}`,
          code: 'generation_error',
          detail,
        },
        { status: 500 },
      );
    }

    if (
      adminReady &&
      db &&
      (response.safetyAction === 'refuse' ||
        response.safetyAction === 'urgent_warning')
    ) {
      try {
        const abuse = await import('@/src/lib/server/abuse');
        const escalation = await abuse.recordSafetyEventAndEscalate(db, {
          uid,
          chatId: parsed.data.chatId,
          category: response.classification,
          safetyAction: response.safetyAction,
        });

        if (escalation?.newlyBlocked) {
          const lockNote =
            escalation.accountStatus === 'suspended'
              ? '\n\nYour account is now suspended from chat for repeated policy violations.'
              : '\n\nChat is temporarily locked after repeated out-of-scope or policy-violating requests.';
          return NextResponse.json({
            ...response,
            answer: `${response.answer}${lockNote}`,
            moderation: {
              accountStatus: escalation.accountStatus,
              chatBlockedUntil: escalation.chatBlockedUntil,
              abuseStrikeCount: escalation.abuseStrikeCount,
            },
          });
        }

        if (escalation) {
          return NextResponse.json({
            ...response,
            moderation: {
              accountStatus: escalation.accountStatus,
              chatBlockedUntil: escalation.chatBlockedUntil,
              abuseStrikeCount: escalation.abuseStrikeCount,
            },
          });
        }
      } catch (error) {
        console.error('Safety escalation failed; returning base response', error);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Research API error', error);
    const detail =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown server error';
    const code =
      error instanceof Error && 'code' in error
        ? String((error as { code?: unknown }).code ?? 'server_error')
        : 'server_error';
    return NextResponse.json(
      {
        error: `Unable to generate a research response. ${detail}`,
        code,
        detail,
      },
      { status: 500 },
    );
  }
}
