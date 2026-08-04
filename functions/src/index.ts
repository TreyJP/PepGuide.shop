import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { z } from 'zod';

import { classifyMessage } from './safety/classify';
import { validateAiOutput } from './safety/validate';
import { enforceRateLimits } from './safety/rate-limit';
import { PEP_GUIDE_MODEL } from './ai/model';
import { buildSystemPrompt } from './ai/prompt';
import { callOpenAi } from './ai/openai';
import { pepGuideResponseSchema, sendMessageSchema } from './ai/schema';
import { buildKnowledgeContext } from './knowledge/retrieve';



initializeApp();

const openaiApiKey = defineSecret('OPENAI_API_KEY');

export const sendResearchMessage = onCall(
  {
    secrets: [openaiApiKey],
    enforceAppCheck: true,
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const parsed = sendMessageSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', 'Invalid request payload.');
    }

    const uid = request.auth.uid;
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new HttpsError('failed-precondition', 'User profile missing.');
    }

    const user = userSnap.data() ?? {};
    if (user.accountStatus === 'suspended') {
      throw new HttpsError('permission-denied', 'Account suspended.');
    }
    if (user.accountStatus === 'cooldown') {
      throw new HttpsError(
        'resource-exhausted',
        'Account is in a temporary cooldown.',
      );
    }

    await enforceRateLimits(db, uid, parsed.data.content);

    const classification = classifyMessage(parsed.data.content);
    if (classification.safetyAction === 'urgent_warning') {
      const response = {
        answer:
          'If you are experiencing severe or potentially life-threatening symptoms, PepGuide cannot assess emergencies. Seek immediate professional help or contact local emergency services.',
        classification: classification.category,
        safetyAction: 'urgent_warning' as const,
        evidenceCards: [],
        citations: [],
        suggestedQuestions: [],
        peptideIds: [],
      };
      await db.collection('safetyEvents').add({
        userId: uid,
        chatId: parsed.data.chatId,
        category: classification.category,
        severity: 'critical',
        action: 'urgent_warning',
        createdAt: new Date().toISOString(),
      });
      return pepGuideResponseSchema.parse(response);
    }

    if (classification.safetyAction === 'refuse') {
      const response = {
        answer:
          "I can't create a personal dosing or injection plan, recommend vendors, or provide reconstitution instructions. I can compare compounds’ mechanisms, available human evidence, regulatory status, reported risks, and research limitations.",
        classification: classification.category,
        safetyAction: 'refuse' as const,
        evidenceCards: [],
        citations: [],
        suggestedQuestions: [
          'Compare mechanisms and evidence quality for two compounds.',
          'Which related compounds have human clinical trials?',
        ],
        peptideIds: [],
      };
      await db.collection('safetyEvents').add({
        userId: uid,
        chatId: parsed.data.chatId,
        category: classification.category,
        severity: 'medium',
        action: 'refuse',
        createdAt: new Date().toISOString(),
      });
      return pepGuideResponseSchema.parse(response);
    }

    const systemPrompt = buildSystemPrompt({
      experienceLevel: user.experienceLevel,
      researchPreferences: user.researchPreferences ?? [],
      knowledgeContext: buildKnowledgeContext(parsed.data.content, 5),
    });



    let modelOutput = await callOpenAi({
      apiKey: openaiApiKey.value(),
      systemPrompt,
      userMessage: parsed.data.content,
    });

    let validated = validateAiOutput(modelOutput);
    if (!validated.ok) {
      modelOutput = await callOpenAi({
        apiKey: openaiApiKey.value(),
        systemPrompt: `${systemPrompt}\n\nSTRICT MODE: Remove any personalized dosing, injection, reconstitution, vendor, or treatment advice. Use research-neutral language only.`,
        userMessage: parsed.data.content,
      });
      validated = validateAiOutput(modelOutput);
    }

    if (!validated.ok) {
      await db.collection('safetyEvents').add({
        userId: uid,
        chatId: parsed.data.chatId,
        category: 'repeated_policy_circumvention',
        severity: 'high',
        action: 'safe_template',
        createdAt: new Date().toISOString(),
      });
      return pepGuideResponseSchema.parse({
        answer:
          'I can help with educational research summaries, evidence comparisons, regulatory context, and known uncertainties. Please rephrase your question as a research inquiry.',
        classification: classification.category,
        safetyAction: 'refuse',
        evidenceCards: [],
        citations: [],
        suggestedQuestions: [
          'Which peptides are researched for this topic?',
          'What human evidence is available?',
        ],
        peptideIds: [],
      });
    }

    const response = pepGuideResponseSchema.parse(validated.value);

    if (!parsed.data.temporary) {
      const messageRef = userRef
        .collection('chats')
        .doc(parsed.data.chatId)
        .collection('messages')
        .doc();
      await messageRef.set({
        role: 'assistant',
        content: response.answer,
        createdAt: new Date().toISOString(),
        status: 'complete',
        classifications: [response.classification],
        citations: response.citations,
        evidenceCards: response.evidenceCards,
        safetyAction: response.safetyAction,
        modelVersion: PEP_GUIDE_MODEL,
      });
    }


    return response;
  },
);


export const deleteUserAccount = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }
  const uid = request.auth.uid;
  const db = getFirestore();
  const userRef = db.collection('users').doc(uid);

  const chats = await userRef.collection('chats').listDocuments();
  await Promise.all(
    chats.map(async (chat) => {
      const messages = await chat.collection('messages').listDocuments();
      await Promise.all(messages.map((message) => message.delete()));
      await chat.delete();
    }),
  );

  const saved = await userRef.collection('savedResearch').listDocuments();
  await Promise.all(saved.map((doc) => doc.delete()));
  const folders = await userRef.collection('folders').listDocuments();
  await Promise.all(folders.map((doc) => doc.delete()));
  await userRef.delete();
  await getAuth().deleteUser(uid);
  return { ok: true };
});

export const health = onCall(async () => ({ ok: true, service: 'pepguide' }));

// Keep zod referenced for future request expansion.
void z;
