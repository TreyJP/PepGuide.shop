import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  limit as fsLimit,
} from 'firebase/firestore';

import { PICKS_ONLY_ANSWER } from '@/src/constants/chat';
import {
  DEFAULT_CHAT_TITLE,
  deriveChatTitle,
  isDefaultChatTitle,
} from '@/src/lib/chat-title';
import {
  getFirebaseAuth,
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import type {
  ChatMessage,
  ChatSummary,
  EvidenceDepth,
  ResearchMode,
} from '@/src/types';
import { createId } from '@/src/utils/dates';

const mockChats = new Map<string, ChatSummary>();
const mockMessages = new Map<string, ChatMessage[]>();

function requireUid() {
  const uid = getFirebaseAuth()?.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  return uid;
}

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function chatsCol(uid: string) {
  return collection(requireDb(), 'users', uid, 'chats');
}

function messagesCol(uid: string, chatId: string) {
  return collection(requireDb(), 'users', uid, 'chats', chatId, 'messages');
}

function mapChat(id: string, data: Record<string, unknown>): ChatSummary {
  return {
    id,
    title: String(data.title ?? DEFAULT_CHAT_TITLE),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    pinned: Boolean(data.pinned),
    archived: Boolean(data.archived),
    temporary: Boolean(data.temporary),
    researchMode: (data.researchMode as ResearchMode) ?? 'quick_overview',
    evidenceDepth: (data.evidenceDepth as EvidenceDepth) ?? 'detailed',
    lastMessagePreview: String(data.lastMessagePreview ?? ''),
    messageCount: Number(data.messageCount ?? 0),
    safetyStatus: (data.safetyStatus as ChatSummary['safetyStatus']) ?? 'allow',
  };
}

function mapMessage(
  id: string,
  chatId: string,
  data: Record<string, unknown>,
): ChatMessage {
  return {
    id,
    chatId,
    role: (data.role as ChatMessage['role']) ?? 'assistant',
    content: String(data.content ?? ''),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    status: (data.status as ChatMessage['status']) ?? 'complete',
    classifications: Array.isArray(data.classifications)
      ? (data.classifications as ChatMessage['classifications'])
      : [],
    citations: Array.isArray(data.citations)
      ? (data.citations as ChatMessage['citations'])
      : [],
    evidenceCards: Array.isArray(data.evidenceCards)
      ? (data.evidenceCards as ChatMessage['evidenceCards'])
      : [],
    safetyAction: (data.safetyAction as ChatMessage['safetyAction']) ?? 'allow',
    modelVersion: data.modelVersion ? String(data.modelVersion) : undefined,
    suggestedQuestions: Array.isArray(data.suggestedQuestions)
      ? (data.suggestedQuestions as string[])
      : undefined,
    peptideIds: Array.isArray(data.peptideIds)
      ? (data.peptideIds as string[])
      : undefined,
  };
}

const mockRepository = {
  async listChats(): Promise<ChatSummary[]> {
    return Array.from(mockChats.values()).sort(
      (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
    );
  },
  async createChat(input?: {
    title?: string;
    researchMode?: ResearchMode;
    evidenceDepth?: EvidenceDepth;
    temporary?: boolean;
  }): Promise<ChatSummary> {
    const now = new Date().toISOString();
    const chat: ChatSummary = {
      id: createId('chat'),
      title: input?.title ?? DEFAULT_CHAT_TITLE,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      archived: false,
      temporary: input?.temporary ?? false,
      researchMode: input?.researchMode ?? 'quick_overview',
      evidenceDepth: input?.evidenceDepth ?? 'detailed',
      lastMessagePreview: '',
      messageCount: 0,
      safetyStatus: 'allow',
    };
    mockChats.set(chat.id, chat);
    mockMessages.set(chat.id, []);
    return chat;
  },
  async updateChat(chatId: string, patch: Partial<ChatSummary>) {
    const existing = mockChats.get(chatId);
    if (!existing) throw new Error('Chat not found');
    const updated = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    mockChats.set(chatId, updated);
    return updated;
  },
  async deleteChat(chatId: string) {
    mockChats.delete(chatId);
    mockMessages.delete(chatId);
  },
  async listMessages(chatId: string, options?: { limit?: number }) {
    const all = mockMessages.get(chatId) ?? [];
    if (!options?.limit) return all;
    return all.slice(Math.max(0, all.length - options.limit));
  },
  async appendMessage(message: ChatMessage) {
    const list = mockMessages.get(message.chatId) ?? [];
    list.push(message);
    mockMessages.set(message.chatId, list);
    const chat = mockChats.get(message.chatId);
    if (chat) {
      const nextTitle =
        message.role === 'user' && isDefaultChatTitle(chat.title)
          ? deriveChatTitle(message.content)
          : chat.title;
      mockChats.set(message.chatId, {
        ...chat,
        updatedAt: message.createdAt,
        lastMessagePreview:
          message.content === PICKS_ONLY_ANSWER
            ? 'Top 3 picks'
            : message.content.slice(0, 120),
        messageCount: list.length,
        safetyStatus: message.safetyAction,
        title: nextTitle,
      });
    }
    return message;
  },
};

const firestoreRepository = {
  async listChats(): Promise<ChatSummary[]> {
    const uid = requireUid();
    const snap = await getDocs(chatsCol(uid));
    return snap.docs
      .map((item) => mapChat(item.id, item.data() as Record<string, unknown>))
      .filter((chat) => !chat.archived)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  },


  async createChat(input?: {
    title?: string;
    researchMode?: ResearchMode;
    evidenceDepth?: EvidenceDepth;
    temporary?: boolean;
  }): Promise<ChatSummary> {
    const uid = requireUid();
    const now = new Date().toISOString();
    const ref = doc(chatsCol(uid));
    const chat: ChatSummary = {
      id: ref.id,
      title: input?.title ?? DEFAULT_CHAT_TITLE,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      archived: false,
      temporary: input?.temporary ?? false,
      researchMode: input?.researchMode ?? 'quick_overview',
      evidenceDepth: input?.evidenceDepth ?? 'detailed',
      lastMessagePreview: '',
      messageCount: 0,
      safetyStatus: 'allow',
    };
    await setDoc(ref, chat);
    return chat;
  },

  async updateChat(chatId: string, patch: Partial<ChatSummary>) {
    const uid = requireUid();
    const chatRef = doc(requireDb(), 'users', uid, 'chats', chatId);
    const updatedAt = new Date().toISOString();
    await updateDoc(chatRef, {
      ...patch,
      updatedAt,
    });
    const snap = await getDoc(chatRef);
    if (!snap.exists()) throw new Error('Chat not found');
    return mapChat(chatId, snap.data() as Record<string, unknown>);
  },

  async deleteChat(chatId: string) {
    const uid = requireUid();
    const messagesSnap = await getDocs(messagesCol(uid, chatId));
    await Promise.all(messagesSnap.docs.map((item) => deleteDoc(item.ref)));
    await deleteDoc(doc(requireDb(), 'users', uid, 'chats', chatId));
  },

  async listMessages(chatId: string, options?: { limit?: number }) {
    const uid = requireUid();
    const messagesQuery = options?.limit
      ? query(
          messagesCol(uid, chatId),
          orderBy('createdAt', 'asc'),
          fsLimit(options.limit),
        )
      : query(messagesCol(uid, chatId), orderBy('createdAt', 'asc'));
    const snap = await getDocs(messagesQuery);
    return snap.docs.map((item) =>
      mapMessage(item.id, chatId, item.data() as Record<string, unknown>),
    );
  },


  async appendMessage(message: ChatMessage) {
    const uid = requireUid();
    const { id: _id, ...payload } = message;
    const ref = await addDoc(messagesCol(uid, message.chatId), payload);

    const chatRef = doc(requireDb(), 'users', uid, 'chats', message.chatId);
    const existingSnap = await getDoc(chatRef);
    const existing = existingSnap.exists()
      ? mapChat(message.chatId, existingSnap.data() as Record<string, unknown>)
      : null;

    const preview =
      message.content === PICKS_ONLY_ANSWER
        ? 'Top 3 picks'
        : message.content.slice(0, 120);

    const safeUpdate: Record<string, unknown> = {
      updatedAt: message.createdAt,
      lastMessagePreview: preview,
      safetyStatus: message.safetyAction,
      messageCount: increment(1),
    };

    if (
      message.role === 'user' &&
      (!existing || isDefaultChatTitle(existing.title))
    ) {
      safeUpdate.title = deriveChatTitle(message.content);
    }

    await updateDoc(chatRef, safeUpdate);

    return { ...message, id: ref.id };
  },
};


export const chatRepository = {
  listChats() {
    return shouldUseMockServices()
      ? mockRepository.listChats()
      : firestoreRepository.listChats();
  },
  createChat(input?: {
    title?: string;
    researchMode?: ResearchMode;
    evidenceDepth?: EvidenceDepth;
    temporary?: boolean;
  }) {
    return shouldUseMockServices()
      ? mockRepository.createChat(input)
      : firestoreRepository.createChat(input);
  },
  updateChat(chatId: string, patch: Partial<ChatSummary>) {
    return shouldUseMockServices()
      ? mockRepository.updateChat(chatId, patch)
      : firestoreRepository.updateChat(chatId, patch);
  },
  deleteChat(chatId: string) {
    return shouldUseMockServices()
      ? mockRepository.deleteChat(chatId)
      : firestoreRepository.deleteChat(chatId);
  },
  listMessages(chatId: string, options?: { limit?: number }) {
    return shouldUseMockServices()
      ? mockRepository.listMessages(chatId, options)
      : firestoreRepository.listMessages(chatId, options);
  },
  appendMessage(message: ChatMessage) {
    return shouldUseMockServices()
      ? mockRepository.appendMessage(message)
      : firestoreRepository.appendMessage(message);
  },
};
