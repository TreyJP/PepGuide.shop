import { PICKS_ONLY_ANSWER, PRO_UNLOCK_ANSWER } from '@/src/constants/chat';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { pepGuideResponseSchema } from '@/src/schemas/ai';
import type { AccountStatus, PepGuideAiResponse } from '@/src/types';
import { onAuthStateChanged, type User } from 'firebase/auth';

export type ChatHistoryTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatModerationState = {
  accountStatus?: AccountStatus;
  chatBlockedUntil?: string | null;
  abuseStrikeCount?: number;
  code?: string;
};

export type SendChatResult = PepGuideAiResponse & {
  moderation?: ChatModerationState;
};

export class ChatApiError extends Error {
  status: number;
  code?: string;
  response?: PepGuideAiResponse;
  moderation?: ChatModerationState;

  constructor(
    message: string,
    options?: {
      status: number;
      code?: string;
      response?: PepGuideAiResponse;
      moderation?: ChatModerationState;
    },
  ) {
    super(message);
    this.name = 'ChatApiError';
    this.status = options?.status ?? 500;
    this.code = options?.code;
    this.response = options?.response;
    this.moderation = options?.moderation;
  }
}

async function waitForFirebaseUser(timeoutMs = 5000): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      window.clearTimeout(timer);
      unsubscribe();
      resolve(user);
    });
  });
}

async function getAuthToken(): Promise<string> {
  const user = await waitForFirebaseUser();
  if (!user) {
    throw new ChatApiError('Sign in required to chat with PepGuide.', {
      status: 401,
      code: 'unauthenticated',
    });
  }

  try {
    return await user.getIdToken();
  } catch {
    // Mobile Safari can briefly return a stale session — force refresh once.
    return user.getIdToken(true);
  }
}

export async function sendChatMessage(params: {
  chatId: string;
  content: string;
  history?: ChatHistoryTurn[];
  isPro?: boolean;
  onToken?: (token: string) => void;
}): Promise<SendChatResult> {
  let token = await getAuthToken();

  const doFetch = (authToken: string) =>
    fetch('/api/research/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        chatId: params.chatId,
        content: params.content,
        history: params.history ?? [],
        isPro: params.isPro ?? false,
      }),
    });

  let response = await doFetch(token);

  // One retry with a fresh token — common right after mobile sign-in.
  if (response.status === 401) {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser ?? (await waitForFirebaseUser(2000));
    if (user) {
      token = await user.getIdToken(true);
      response = await doFetch(token);
    }
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = data as {
      error?: string;
      code?: string;
      moderation?: ChatModerationState;
    } | null;

    // 403/429 may still return a structured PepGuide reply for in-chat display.
    const structured = pepGuideResponseSchema.safeParse(data);
    if (structured.success) {
      throw new ChatApiError(structured.data.answer, {
        status: response.status,
        code: body?.code,
        response: structured.data,
        moderation: body?.moderation,
      });
    }

    throw new ChatApiError(
      body?.error ?? 'Unable to generate a research response.',
      {
        status: response.status,
        code: body?.code,
        moderation: body?.moderation,
      },
    );
  }

  const parsed = pepGuideResponseSchema.parse(data);
  const moderation = (data as { moderation?: ChatModerationState })?.moderation;

  if (
    params.onToken &&
    parsed.answer !== PICKS_ONLY_ANSWER &&
    parsed.answer !== PRO_UNLOCK_ANSWER
  ) {
    await revealAnswerProgressively(parsed.answer, params.onToken);
  }

  return moderation ? { ...parsed, moderation } : parsed;
}

/** Progressive reveal so the reply feels live after the full JSON lands. */
async function revealAnswerProgressively(
  answer: string,
  onToken: (token: string) => void,
) {
  const chunks = answer.match(/\S+\s*|\s+/g) ?? [answer];
  let buffer = '';

  for (let i = 0; i < chunks.length; i += 1) {
    buffer += chunks[i] ?? '';

    // Batch a few words so paint stays smooth without feeling sluggish.
    const shouldFlush =
      i === chunks.length - 1 ||
      buffer.length >= 18 ||
      /[.!?]\s*$/.test(buffer);

    if (!shouldFlush) continue;

    onToken(buffer);
    buffer = '';

    const remaining = chunks.length - i;
    const delay = remaining > 80 ? 8 : remaining > 30 ? 12 : 16;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (buffer) onToken(buffer);
}
