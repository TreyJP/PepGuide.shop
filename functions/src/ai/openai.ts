import OpenAI from 'openai';

import { PEP_GUIDE_MODEL } from './model';

export async function callOpenAi(params: {
  apiKey: string;
  systemPrompt: string;
  userMessage: string;
}): Promise<unknown> {
  const client = new OpenAI({ apiKey: params.apiKey });
  const completion = await client.chat.completions.create({
    model: PEP_GUIDE_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userMessage },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty model response');
  }
  return JSON.parse(content) as unknown;
}
