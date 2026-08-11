import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  limit as fsLimit,
} from 'firebase/firestore';

import { assertForumContentAllowed } from '@/src/lib/forum-moderation';
import {
  getFirebaseAuth,
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import type {
  ProConsult,
  ProConsultMessage,
  ProConsultStatus,
} from '@/src/types/consults';
import { createId } from '@/src/utils/dates';

const mockConsults = new Map<string, ProConsult>();
const mockMessages = new Map<string, ProConsultMessage[]>();

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function requireUid() {
  const uid =
    getFirebaseAuth()?.currentUser?.uid ?? useAuthStore.getState().user?.id;
  if (!uid) throw new Error('Not authenticated');
  return uid;
}

function mapConsult(id: string, data: Record<string, unknown>): ProConsult {
  const statusRaw = String(data.status ?? 'open');
  const status: ProConsultStatus =
    statusRaw === 'answered' || statusRaw === 'closed' ? statusRaw : 'open';
  return {
    id,
    userId: String(data.userId ?? ''),
    userDisplayName: String(data.userDisplayName ?? 'Member'),
    subject: String(data.subject ?? ''),
    status,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? data.createdAt ?? new Date().toISOString()),
    lastMessagePreview: String(data.lastMessagePreview ?? ''),
    messageCount: Number(data.messageCount ?? 0),
    searchText: String(data.searchText ?? ''),
  };
}

function mapMessage(
  id: string,
  consultId: string,
  data: Record<string, unknown>,
): ProConsultMessage {
  return {
    id,
    consultId,
    body: String(data.body ?? ''),
    authorId: String(data.authorId ?? ''),
    authorDisplayName: String(data.authorDisplayName ?? 'Member'),
    authorIsAdmin: Boolean(data.authorIsAdmin),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

function buildSearchText(subject: string, body: string, author: string): string {
  return `${subject} ${body} ${author}`.toLowerCase();
}

function sortConsults(items: ProConsult[]): ProConsult[] {
  return [...items].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
}

function useMock(): boolean {
  return shouldUseMockServices() || !getFirestoreDb();
}

export const consultsRepository = {
  async listMine(userId: string): Promise<ProConsult[]> {
    if (useMock()) {
      return sortConsults(
        [...mockConsults.values()].filter((item) => item.userId === userId),
      );
    }

    const snap = await getDocs(
      query(
        collection(requireDb(), 'proConsults'),
        where('userId', '==', userId),
        fsLimit(80),
      ),
    );
    return sortConsults(
      snap.docs.map((item) =>
        mapConsult(item.id, item.data() as Record<string, unknown>),
      ),
    );
  },

  async listAll(options?: { status?: ProConsultStatus }): Promise<ProConsult[]> {
    if (useMock()) {
      let items = [...mockConsults.values()];
      if (options?.status) {
        items = items.filter((item) => item.status === options.status);
      }
      return sortConsults(items);
    }

    const snap = await getDocs(
      query(
        collection(requireDb(), 'proConsults'),
        orderBy('updatedAt', 'desc'),
        fsLimit(100),
      ),
    );
    let items = snap.docs.map((item) =>
      mapConsult(item.id, item.data() as Record<string, unknown>),
    );
    if (options?.status) {
      items = items.filter((item) => item.status === options.status);
    }
    return items;
  },

  async get(consultId: string): Promise<ProConsult | null> {
    if (useMock()) return mockConsults.get(consultId) ?? null;
    const snap = await getDoc(doc(requireDb(), 'proConsults', consultId));
    if (!snap.exists()) return null;
    return mapConsult(snap.id, snap.data() as Record<string, unknown>);
  },

  async listMessages(consultId: string): Promise<ProConsultMessage[]> {
    if (useMock()) {
      return [...(mockMessages.get(consultId) ?? [])].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      );
    }

    const snap = await getDocs(
      query(
        collection(requireDb(), 'proConsults', consultId, 'messages'),
        orderBy('createdAt', 'asc'),
        fsLimit(200),
      ),
    );
    return snap.docs.map((item) =>
      mapMessage(item.id, consultId, item.data() as Record<string, unknown>),
    );
  },

  async createConsult(input: {
    subject: string;
    body: string;
    userDisplayName: string;
    authorIsAdmin?: boolean;
  }): Promise<ProConsult> {
    const uid = requireUid();
    const subject = input.subject.trim();
    const body = input.body.trim();
    assertForumContentAllowed(subject, body);

    if (subject.length < 4 || subject.length > 120) {
      throw new Error('Subject must be between 4 and 120 characters.');
    }
    if (body.length < 8 || body.length > 8000) {
      throw new Error('Question must be between 8 and 8,000 characters.');
    }

    const now = new Date().toISOString();
    const id = createId('consult');
    const messageId = createId('cmsg');
    const displayName = input.userDisplayName.trim() || 'Member';

    const consult: ProConsult = {
      id,
      userId: uid,
      userDisplayName: displayName,
      subject,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      lastMessagePreview: body.slice(0, 160),
      messageCount: 1,
      searchText: buildSearchText(subject, body, displayName),
    };

    const message: ProConsultMessage = {
      id: messageId,
      consultId: id,
      body,
      authorId: uid,
      authorDisplayName: displayName,
      authorIsAdmin: Boolean(input.authorIsAdmin),
      createdAt: now,
    };

    if (useMock()) {
      mockConsults.set(id, consult);
      mockMessages.set(id, [message]);
      return consult;
    }

    const db = requireDb();
    await setDoc(doc(db, 'proConsults', id), {
      userId: consult.userId,
      userDisplayName: consult.userDisplayName,
      subject: consult.subject,
      status: consult.status,
      createdAt: consult.createdAt,
      updatedAt: consult.updatedAt,
      lastMessagePreview: consult.lastMessagePreview,
      messageCount: consult.messageCount,
      searchText: consult.searchText,
    });
    await setDoc(doc(db, 'proConsults', id, 'messages', messageId), {
      body: message.body,
      authorId: message.authorId,
      authorDisplayName: message.authorDisplayName,
      authorIsAdmin: message.authorIsAdmin,
      createdAt: message.createdAt,
    });
    return consult;
  },

  async addMessage(input: {
    consultId: string;
    body: string;
    authorDisplayName: string;
    authorIsAdmin?: boolean;
  }): Promise<ProConsultMessage> {
    const uid = requireUid();
    const body = input.body.trim();
    assertForumContentAllowed(body);
    if (body.length < 1 || body.length > 8000) {
      throw new Error('Message must be under 8,000 characters.');
    }

    const consult = await this.get(input.consultId);
    if (!consult) throw new Error('Consult not found.');
    if (consult.status === 'closed' && !input.authorIsAdmin) {
      throw new Error('This consult is closed.');
    }

    const now = new Date().toISOString();
    const id = createId('cmsg');
    const message: ProConsultMessage = {
      id,
      consultId: input.consultId,
      body,
      authorId: uid,
      authorDisplayName: input.authorDisplayName.trim() || 'Member',
      authorIsAdmin: Boolean(input.authorIsAdmin),
      createdAt: now,
    };

    const nextStatus: ProConsultStatus = input.authorIsAdmin
      ? 'answered'
      : 'open';

    if (useMock()) {
      const list = mockMessages.get(input.consultId) ?? [];
      list.push(message);
      mockMessages.set(input.consultId, list);
      mockConsults.set(input.consultId, {
        ...consult,
        status: nextStatus,
        updatedAt: now,
        lastMessagePreview: body.slice(0, 160),
        messageCount: consult.messageCount + 1,
      });
      return message;
    }

    const db = requireDb();
    await setDoc(doc(db, 'proConsults', input.consultId, 'messages', id), {
      body: message.body,
      authorId: message.authorId,
      authorDisplayName: message.authorDisplayName,
      authorIsAdmin: message.authorIsAdmin,
      createdAt: message.createdAt,
    });
    await updateDoc(doc(db, 'proConsults', input.consultId), {
      updatedAt: now,
      lastMessagePreview: body.slice(0, 160),
      messageCount: increment(1),
      status: nextStatus,
    });
    return message;
  },

  async setStatus(
    consultId: string,
    status: ProConsultStatus,
  ): Promise<void> {
    const now = new Date().toISOString();
    if (useMock()) {
      const current = mockConsults.get(consultId);
      if (!current) throw new Error('Consult not found.');
      mockConsults.set(consultId, { ...current, status, updatedAt: now });
      return;
    }
    await updateDoc(doc(requireDb(), 'proConsults', consultId), {
      status,
      updatedAt: now,
    });
  },
};
