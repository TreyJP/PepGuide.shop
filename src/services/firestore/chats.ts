import {
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
import { isEnvAdminEmail } from '@/src/lib/admin';
import {
  getFirebaseAuth,
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import { partnersRepository } from '@/src/services/firestore/partners';
import { publicProfileRepository } from '@/src/services/firestore/public-profiles';
import { useAuthStore } from '@/src/stores/auth-store';
import type {
  ChatMessage,
  ChatSummary,
  EvidenceDepth,
  ResearchMode,
} from '@/src/types';
import { createId } from '@/src/utils/dates';

export type SharedChatRef = {
  ownerUid: string;
  title?: string;
  updatedAt?: string;
};

export type LoadedChatThread = {
  chatId: string;
  ownerUid: string;
  isOwner: boolean;
  messages: ChatMessage[];
  title?: string;
};

async function resolveIsAdmin(email: string): Promise<boolean> {
  if (isEnvAdminEmail(email)) return true;
  try {
    return await partnersRepository.isAllowlistedAdmin(email);
  } catch {
    return false;
  }
}

async function bumpRankingForNewChat() {
  const user = useAuthStore.getState().user;
  if (!user) return;
  try {
    const isAdmin = await resolveIsAdmin(user.email);
    await publicProfileRepository.recordChatCreated({
      displayName: user.displayName || 'Researcher',
      photoURL: user.photoURL,
      isAdmin,
    });
  } catch (error) {
    console.warn('[PepGuide] Failed to update chat ranking count', error);
  }
}

const mockChats = new Map<string, ChatSummary>();
const mockMessages = new Map<string, ChatMessage[]>();
const mockSharedRefs = new Map<string, SharedChatRef>();

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

function sharedChatRefDoc(chatId: string) {
  return doc(requireDb(), 'sharedChatRefs', chatId);
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

async function upsertSharedChatRef(
  chatId: string,
  ownerUid: string,
  title?: string,
) {
  await setDoc(
    sharedChatRefDoc(chatId),
    {
      ownerUid,
      title: title ?? DEFAULT_CHAT_TITLE,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function listMessagesForOwner(
  ownerUid: string,
  chatId: string,
  options?: { limit?: number },
): Promise<ChatMessage[]> {
  const messagesQuery = options?.limit
    ? query(
        messagesCol(ownerUid, chatId),
        orderBy('createdAt', 'asc'),
        fsLimit(options.limit),
      )
    : query(messagesCol(ownerUid, chatId), orderBy('createdAt', 'asc'));
  const snap = await getDocs(messagesQuery);
  return snap.docs.map((item) =>
    mapMessage(item.id, chatId, item.data() as Record<string, unknown>),
  );
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
    mockSharedRefs.set(chat.id, {
      ownerUid: 'mock-user',
      title: chat.title,
      updatedAt: now,
    });
    void bumpRankingForNewChat();
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
    mockSharedRefs.set(chatId, {
      ownerUid: 'mock-user',
      title: updated.title,
      updatedAt: updated.updatedAt,
    });
    return updated;
  },
  async deleteChat(chatId: string) {
    mockChats.delete(chatId);
    mockMessages.delete(chatId);
    mockSharedRefs.delete(chatId);
    void publicProfileRepository.recordChatDeleted().catch(() => undefined);
  },
  async listMessages(chatId: string, options?: { limit?: number }) {
    const all = mockMessages.get(chatId) ?? [];
    if (!options?.limit) return all;
    return all.slice(Math.max(0, all.length - options.limit));
  },
  async loadSharedThread(chatId: string): Promise<LoadedChatThread | null> {
    const ref = mockSharedRefs.get(chatId);
    const currentUid = getFirebaseAuth()?.currentUser?.uid ?? 'mock-user';
    if (!ref && !mockChats.has(chatId)) return null;
    const ownerUid = ref?.ownerUid ?? currentUid;
    return {
      chatId,
      ownerUid,
      isOwner: ownerUid === currentUid,
      messages: mockMessages.get(chatId) ?? [],
      title: mockChats.get(chatId)?.title ?? ref?.title,
    };
  },
  async ensureShareable(chatId: string, title?: string) {
    const uid = getFirebaseAuth()?.currentUser?.uid ?? 'mock-user';
    mockSharedRefs.set(chatId, {
      ownerUid: uid,
      title: title ?? mockChats.get(chatId)?.title ?? DEFAULT_CHAT_TITLE,
      updatedAt: new Date().toISOString(),
    });
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
      mockSharedRefs.set(message.chatId, {
        ownerUid: getFirebaseAuth()?.currentUser?.uid ?? 'mock-user',
        title: nextTitle,
        updatedAt: message.createdAt,
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
    await upsertSharedChatRef(chat.id, uid, chat.title);
    void bumpRankingForNewChat();
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
    const mapped = mapChat(chatId, snap.data() as Record<string, unknown>);
    await upsertSharedChatRef(chatId, uid, mapped.title);
    return mapped;
  },

  async deleteChat(chatId: string) {
    const uid = requireUid();
    const messagesSnap = await getDocs(messagesCol(uid, chatId));
    await Promise.all(messagesSnap.docs.map((item) => deleteDoc(item.ref)));
    await deleteDoc(doc(requireDb(), 'users', uid, 'chats', chatId));
    try {
      await deleteDoc(sharedChatRefDoc(chatId));
    } catch {
      // Index may not exist for older chats.
    }
    void publicProfileRepository.recordChatDeleted().catch(() => undefined);
  },

  async listMessages(chatId: string, options?: { limit?: number }) {
    const uid = requireUid();
    return listMessagesForOwner(uid, chatId, options);
  },

  async loadSharedThread(chatId: string): Promise<LoadedChatThread | null> {
    // Wait briefly for Auth so owner vs viewer is correct on first paint (mobile cold start).
    const auth = getFirebaseAuth();
    if (auth) {
      await Promise.race([
        auth.authStateReady(),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, 1500);
        }),
      ]);
    }

    const currentUid = getFirebaseAuth()?.currentUser?.uid ?? null;

    // Prefer own chat when signed in (works even before a share index exists).
    if (currentUid) {
      try {
        const ownChat = await getDoc(
          doc(requireDb(), 'users', currentUid, 'chats', chatId),
        );
        if (ownChat.exists()) {
          const data = ownChat.data() as Record<string, unknown>;
          const messages = await listMessagesForOwner(currentUid, chatId);
          void upsertSharedChatRef(
            chatId,
            currentUid,
            String(data.title ?? DEFAULT_CHAT_TITLE),
          ).catch(() => undefined);
          return {
            chatId,
            ownerUid: currentUid,
            isOwner: true,
            messages,
            title: String(data.title ?? DEFAULT_CHAT_TITLE),
          };
        }
      } catch {
        // Fall through to shared lookup.
      }
    }

    const refSnap = await getDoc(sharedChatRefDoc(chatId));
    if (!refSnap.exists()) return null;
    const data = refSnap.data() as Record<string, unknown>;
    const ownerUid = String(data.ownerUid ?? '');
    if (!ownerUid) return null;

    const messages = await listMessagesForOwner(ownerUid, chatId);
    return {
      chatId,
      ownerUid,
      isOwner: Boolean(currentUid && currentUid === ownerUid),
      messages,
      title:
        typeof data.title === 'string' && data.title.trim()
          ? data.title
          : undefined,
    };
  },

  async ensureShareable(chatId: string, title?: string) {
    const uid = requireUid();
    await upsertSharedChatRef(chatId, uid, title);
  },

  async appendMessage(message: ChatMessage) {
    const uid = requireUid();
    // Keep the client message id so reloads don't create duplicate bubbles.
    const messageRef = doc(
      requireDb(),
      'users',
      uid,
      'chats',
      message.chatId,
      'messages',
      message.id,
    );
    const { id: _id, ...payload } = message;
    const existingMessage = await getDoc(messageRef);
    await setDoc(messageRef, payload, { merge: true });

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
    };

    // Only bump count for first write of this message id.
    if (!existingMessage.exists()) {
      safeUpdate.messageCount = increment(1);
    }

    let nextTitle = existing?.title;
    if (
      message.role === 'user' &&
      (!existing || isDefaultChatTitle(existing.title))
    ) {
      nextTitle = deriveChatTitle(message.content);
      safeUpdate.title = nextTitle;
    }

    await updateDoc(chatRef, safeUpdate);
    await upsertSharedChatRef(
      message.chatId,
      uid,
      nextTitle ?? existing?.title ?? DEFAULT_CHAT_TITLE,
    );

    return message;
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
  loadSharedThread(chatId: string) {
    return shouldUseMockServices()
      ? mockRepository.loadSharedThread(chatId)
      : firestoreRepository.loadSharedThread(chatId);
  },
  ensureShareable(chatId: string, title?: string) {
    return shouldUseMockServices()
      ? mockRepository.ensureShareable(chatId, title)
      : firestoreRepository.ensureShareable(chatId, title);
  },
  appendMessage(message: ChatMessage) {
    return shouldUseMockServices()
      ? mockRepository.appendMessage(message)
      : firestoreRepository.appendMessage(message);
  },
};
