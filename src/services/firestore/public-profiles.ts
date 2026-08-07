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
  limit as fsLimit,
} from 'firebase/firestore';

import {
  getFirebaseAuth,
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import type { PublicProfile } from '@/src/types';

const mockProfiles = new Map<string, PublicProfile>();

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

function mapProfile(id: string, data: Record<string, unknown>): PublicProfile {
  return {
    id,
    displayName: String(data.displayName ?? 'Researcher'),
    photoURL: (data.photoURL as string | null) ?? null,
    chatCount: Number(data.chatCount ?? 0),
    isAdmin: Boolean(data.isAdmin),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

async function upsertOwnProfileLive(input: {
  displayName: string;
  photoURL?: string | null;
  isAdmin: boolean;
  bumpChatCount?: boolean;
}): Promise<void> {
  const uid = requireUid();
  const now = new Date().toISOString();
  const ref = doc(requireDb(), 'publicProfiles', uid);
  await setDoc(
    ref,
    {
      displayName: input.displayName,
      photoURL: input.photoURL ?? null,
      isAdmin: input.isAdmin,
      updatedAt: now,
      chatCount: input.bumpChatCount ? increment(1) : increment(0),
    },
    { merge: true },
  );
}

async function decrementChatCountLive(): Promise<void> {
  const uid = requireUid();
  const ref = doc(requireDb(), 'publicProfiles', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = Number(snap.data()?.chatCount ?? 0);
  await updateDoc(ref, {
    chatCount: Math.max(0, current - 1),
    updatedAt: new Date().toISOString(),
  });
}

async function listRankingLive(limit = 50): Promise<PublicProfile[]> {
  const snap = await getDocs(
    query(
      collection(requireDb(), 'publicProfiles'),
      orderBy('chatCount', 'desc'),
      fsLimit(limit),
    ),
  );
  return snap.docs
    .map((item) => mapProfile(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => {
      if (b.chatCount !== a.chatCount) return b.chatCount - a.chatCount;
      // Admins float slightly when tied so staff stay visible.
      if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });
}

function upsertOwnProfileMock(input: {
  displayName: string;
  photoURL?: string | null;
  isAdmin: boolean;
  bumpChatCount?: boolean;
}): void {
  const uid = requireUid();
  const existing = mockProfiles.get(uid);
  const next: PublicProfile = {
    id: uid,
    displayName: input.displayName,
    photoURL: input.photoURL ?? null,
    chatCount: (existing?.chatCount ?? 0) + (input.bumpChatCount ? 1 : 0),
    isAdmin: input.isAdmin,
    updatedAt: new Date().toISOString(),
  };
  if (!input.bumpChatCount && existing) {
    next.chatCount = existing.chatCount;
  }
  mockProfiles.set(uid, next);
}

export const publicProfileRepository = {
  async getProfile(userId: string): Promise<PublicProfile | null> {
    if (shouldUseMockServices()) {
      if (mockProfiles.size === 0) {
        await this.listRanking(5);
      }
      return mockProfiles.get(userId) ?? null;
    }
    const snap = await getDoc(doc(requireDb(), 'publicProfiles', userId));
    if (!snap.exists()) return null;
    return mapProfile(snap.id, snap.data() as Record<string, unknown>);
  },

  async syncOwnProfile(input: {
    displayName: string;
    photoURL?: string | null;
    isAdmin: boolean;
  }): Promise<void> {
    if (shouldUseMockServices()) {
      upsertOwnProfileMock(input);
      return;
    }
    await upsertOwnProfileLive(input);
  },

  async recordChatCreated(input: {
    displayName: string;
    photoURL?: string | null;
    isAdmin: boolean;
  }): Promise<void> {
    if (shouldUseMockServices()) {
      upsertOwnProfileMock({ ...input, bumpChatCount: true });
      // Keep mock auth chatCount loosely in sync when possible.
      return;
    }
    await upsertOwnProfileLive({ ...input, bumpChatCount: true });
    try {
      const uid = requireUid();
      await updateDoc(doc(requireDb(), 'users', uid), {
        chatCount: increment(1),
      });
    } catch {
      // Ranking still works from publicProfiles if user doc update fails.
    }
  },

  async recordChatDeleted(): Promise<void> {
    if (shouldUseMockServices()) {
      const uid = requireUid();
      const existing = mockProfiles.get(uid);
      if (!existing) return;
      mockProfiles.set(uid, {
        ...existing,
        chatCount: Math.max(0, existing.chatCount - 1),
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    await decrementChatCountLive();
    try {
      const uid = requireUid();
      await updateDoc(doc(requireDb(), 'users', uid), {
        chatCount: increment(-1),
      });
    } catch {
      // ignore
    }
  },

  async listRanking(limit = 50): Promise<PublicProfile[]> {
    if (shouldUseMockServices()) {
      // Seed a few demo ranks in mock mode.
      if (mockProfiles.size === 0) {
        mockProfiles.set('admin-demo', {
          id: 'admin-demo',
          displayName: 'PepGuide Staff',
          photoURL: null,
          chatCount: 42,
          isAdmin: true,
          updatedAt: new Date().toISOString(),
        });
        mockProfiles.set('member-demo', {
          id: 'member-demo',
          displayName: 'Research Regular',
          photoURL: null,
          chatCount: 18,
          isAdmin: false,
          updatedAt: new Date().toISOString(),
        });
      }
      return [...mockProfiles.values()]
        .sort((a, b) => b.chatCount - a.chatCount)
        .slice(0, limit);
    }
    return listRankingLive(limit);
  },
};
