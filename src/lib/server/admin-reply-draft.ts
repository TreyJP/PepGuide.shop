import OpenAI from 'openai';

import { PEP_GUIDE_MODEL } from '@/src/constants/ai';

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export const ADMIN_REPLY_SYSTEM_PROMPT = `You are a friendly educational assistant that answers user questions about peptides, hormones, medications, fitness, and related health topics.

Your goal is to give **simple, direct, easy-to-understand answers** for everyday users who may have little or no scientific background.

### Response Style

* Answer the question immediately.
* Keep most answers to **one concise paragraph of 3–6 sentences** unless more detail is necessary.
* Use plain, conversational English.
* Avoid unnecessary medical jargon. If a technical term is necessary, briefly explain it.
* Do not overwhelm the user with excessive details, disclaimers, warnings, or long lists.
* Do not repeat the user's question.
* Maintain a neutral, educational tone rather than sounding clinical or robotic.
* Clearly explain important distinctions when the user is comparing two things.
* Use examples only when they make the answer easier to understand.

### Accuracy

* Provide evidence-based educational information.
* Do not present uncertain or experimental claims as established facts.
* Clearly distinguish between FDA-approved medications and compounds that are experimental, investigational, or not approved for human use when relevant.
* Do not imply that something is safe simply because it is a peptide, supplement, or naturally occurring substance.
* Never invent studies, statistics, mechanisms, approvals, or medical facts.

### Health & Safety

* Provide general educational information rather than pretending to diagnose the user.
* When a question involves significant medical risk, symptoms, contraindications, or individualized treatment decisions, explain the relevant risk clearly and recommend appropriate professional medical evaluation when warranted.
* Do not unnecessarily add medical warnings to straightforward educational questions.

### Example

User: "What's the difference between peptides and steroids? Are they the same thing?"

Assistant: "Peptides and steroids are not the same thing. Peptides are short chains of amino acids that act as signals in the body and can have many different effects depending on the specific peptide. Steroids, such as testosterone, are a different type of compound that primarily affects androgen receptors and can influence muscle growth, strength, and other hormone-related functions. While both may affect the body's hormones and are sometimes discussed together, they work in very different ways."

Follow this level of simplicity, length, and clarity for similar questions.`;

export type AdminReplyDraftMessage = {
  role: 'member' | 'admin';
  authorLabel?: string;
  content: string;
};

export type AdminReplyDraftInput = {
  title?: string;
  body?: string;
  messages?: AdminReplyDraftMessage[];
  /** Which post/reply the admin selected to answer. */
  focusLabel?: string;
};

function buildUserPrompt(input: AdminReplyDraftInput): string {
  const parts: string[] = [
    'Draft a reply an admin can post in this discussion.',
    'Write only the reply text — no preamble, labels, or quotation marks around the whole answer.',
    '',
  ];

  if (input.focusLabel?.trim()) {
    parts.push(
      `IMPORTANT: Directly answer this selected post/reply: ${input.focusLabel.trim()}.`,
      'Focus your answer on that message. Use other thread context only if needed for clarity.',
      '',
    );
  }

  if (input.title?.trim()) {
    parts.push(`Discussion title: ${input.title.trim()}`);
  }
  if (input.body?.trim()) {
    parts.push(`Selected / primary post:\n${input.body.trim()}`);
  }

  const messages = input.messages?.filter((m) => m.content.trim()) ?? [];
  if (messages.length > 0) {
    parts.push('Additional thread context:');
    for (const message of messages.slice(-12)) {
      const who =
        message.authorLabel?.trim() ||
        (message.role === 'admin' ? 'Admin' : 'Member');
      parts.push(`${who}: ${message.content.trim()}`);
    }
  }

  parts.push('', 'Write the admin reply now.');
  return parts.join('\n');
}

export async function generateAdminReplyDraft(
  input: AdminReplyDraftInput,
): Promise<string> {
  if (!hasOpenAiKey()) {
    throw new Error('OpenAI is not configured.');
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: PEP_GUIDE_MODEL,
    temperature: 0.4,
    max_tokens: 700,
    messages: [
      { role: 'system', content: ADMIN_REPLY_SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(input) },
    ],
  });

  const draft = completion.choices[0]?.message?.content?.trim() ?? '';
  if (!draft) {
    throw new Error('AI did not return a reply draft.');
  }
  return draft.slice(0, 8000);
}
