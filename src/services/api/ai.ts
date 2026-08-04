import { PICKS_ONLY_ANSWER } from '@/src/constants/chat';
import { pepGuideResponseSchema } from '@/src/schemas/ai';
import type { PepGuideAiResponse } from '@/src/types';

export type ChatHistoryTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export async function sendChatMessage(params: {
  chatId: string;
  content: string;
  history?: ChatHistoryTurn[];
  onToken?: (token: string) => void;
}): Promise<PepGuideAiResponse> {
  const response = await fetch('/api/research/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId: params.chatId,
      content: params.content,
      history: params.history ?? [],
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorBody?.error ?? 'Unable to generate a research response.');
  }

  const data: unknown = await response.json();
  const parsed = pepGuideResponseSchema.parse(data);

  if (params.onToken && parsed.answer !== PICKS_ONLY_ANSWER) {
    const parts = parsed.answer.split(' ');
    for (const part of parts) {
      params.onToken(`${part} `);
      await new Promise((resolve) => setTimeout(resolve, 6));
    }
  }

  return parsed;
}
