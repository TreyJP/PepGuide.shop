import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateResearchResponse } from '@/src/lib/server/openai';

const turnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const bodySchema = z.object({
  chatId: z.string().min(1),
  content: z.string().min(1).max(4000),
  history: z.array(turnSchema).max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload.' },
        { status: 400 },
      );
    }

    const response = await generateResearchResponse(
      parsed.data.content,
      parsed.data.history ?? [],
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error('Research API error', error);
    return NextResponse.json(
      { error: 'Unable to generate a research response.' },
      { status: 500 },
    );
  }
}
