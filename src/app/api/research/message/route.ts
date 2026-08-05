import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  assertChatAccess,
  blockedAccountResponse,
  recordSafetyEventAndEscalate,
} from '@/src/lib/server/abuse';
import { isEnvAdminEmail } from '@/src/lib/admin';
import {
  isFirebaseAdminConfigured,
  tryGetAdminDb,
  verifyBearerToken,
} from '@/src/lib/server/firebase-admin';
import { generateResearchResponse } from '@/src/lib/server/openai';
import { enforceRateLimits, RateLimitError } from '@/src/lib/server/rate-limit';
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

    // Only use Admin features when credentials are real (not FILL_ME placeholders).
    const db = tryGetAdminDb();
    const adminReady = Boolean(db) && isFirebaseAdminConfigured();
    let isPro = Boolean(parsed.data.isPro);

    if (adminReady && db) {
      const access = await assertChatAccess(db, uid);
      if (!access.allowed) {
        // Missing profile should not hard-fail chat — continue as free user.
        if (access.code === 'account_suspended' && access.reason.includes('missing')) {
          console.warn('User profile missing for chat; continuing without admin gates', uid);
        } else {
          const blocked = blockedAccountResponse({
            reason: access.reason,
            code: access.code,
            accountStatus: access.accountStatus,
            chatBlockedUntil: access.chatBlockedUntil,
          });
          return NextResponse.json(blocked, { status: 403 });
        }
      }

      try {
        await enforceRateLimits(db, uid, parsed.data.content);
      } catch (error) {
        if (error instanceof RateLimitError) {
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
          const adminsSnap = await db.collection('config').doc('admins').get();
          const emails = adminsSnap.data()?.emails;
          isAdminUser =
            Array.isArray(emails) &&
            emails.map((item) => String(item).toLowerCase()).includes(userEmail);
        }
        isPro =
          userSnap.data()?.subscriptionTier === 'pro' || isAdminUser;
      } catch (error) {
        console.error('Pro status lookup failed; continuing as free', error);
      }
    }

    const response = await generateResearchResponse(
      parsed.data.content,
      parsed.data.history ?? [],
      { isPro },
    );

    if (
      adminReady &&
      db &&
      (response.safetyAction === 'refuse' ||
        response.safetyAction === 'urgent_warning')
    ) {
      try {
        const escalation = await recordSafetyEventAndEscalate(db, {
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
      error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      {
        error: `Unable to generate a research response. ${detail}`,
        code: 'server_error',
        detail,
      },
      { status: 500 },
    );
  }
}
