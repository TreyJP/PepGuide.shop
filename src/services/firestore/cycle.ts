import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import {
  getFirebaseAuth,
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import type { CycleFrequency, CycleItem } from '@/src/types';
import { createId } from '@/src/utils/dates';

const mockItems = new Map<string, CycleItem>();

function requireUid() {
  const uid = getFirebaseAuth()?.currentUser?.uid;
  if (!uid) throw new Error('Sign in to manage your cycle log.');
  return uid;
}

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function cycleCol(uid: string) {
  return collection(requireDb(), 'users', uid, 'cycleItems');
}

function mapItem(id: string, data: Record<string, unknown>): CycleItem {
  return {
    id,
    peptideId: String(data.peptideId ?? ''),
    name: String(data.name ?? 'Peptide'),
    dose: String(data.dose ?? ''),
    frequency: (data.frequency as CycleFrequency) ?? 'weekly',
    frequencyLabel:
      typeof data.frequencyLabel === 'string' ? data.frequencyLabel : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

export type CycleItemInput = {
  peptideId: string;
  name: string;
  dose: string;
  frequency: CycleFrequency;
  frequencyLabel?: string;
  notes?: string;
};

async function listMock(): Promise<CycleItem[]> {
  return Array.from(mockItems.values()).sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
}

async function listLive(): Promise<CycleItem[]> {
  const uid = requireUid();
  const snap = await getDocs(
    query(cycleCol(uid), orderBy('updatedAt', 'desc')),
  );
  return snap.docs.map((item) =>
    mapItem(item.id, item.data() as Record<string, unknown>),
  );
}

async function addMock(input: CycleItemInput): Promise<CycleItem> {
  const now = new Date().toISOString();
  const item: CycleItem = {
    id: createId('cycle'),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  mockItems.set(item.id, item);
  return item;
}

async function addLive(input: CycleItemInput): Promise<CycleItem> {
  const uid = requireUid();
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    peptideId: input.peptideId,
    name: input.name,
    dose: input.dose,
    frequency: input.frequency,
    createdAt: now,
    updatedAt: now,
  };
  if (input.frequencyLabel?.trim()) {
    payload.frequencyLabel = input.frequencyLabel.trim();
  }
  if (input.notes?.trim()) {
    payload.notes = input.notes.trim();
  }
  const ref = await addDoc(cycleCol(uid), payload);
  return mapItem(ref.id, payload);
}

async function updateMock(
  id: string,
  patch: Partial<CycleItemInput>,
): Promise<CycleItem> {
  const existing = mockItems.get(id);
  if (!existing) throw new Error('Cycle item not found');
  const updated: CycleItem = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  mockItems.set(id, updated);
  return updated;
}

async function updateLive(
  id: string,
  patch: Partial<CycleItemInput>,
): Promise<CycleItem> {
  const uid = requireUid();
  const items = await listLive();
  const existing = items.find((item) => item.id === id);
  if (!existing) throw new Error('Cycle item not found');
  const updatedAt = new Date().toISOString();
  const next = { ...existing, ...patch, updatedAt };
  await updateDoc(doc(requireDb(), 'users', uid, 'cycleItems', id), {
    peptideId: next.peptideId,
    name: next.name,
    dose: next.dose,
    frequency: next.frequency,
    frequencyLabel: next.frequencyLabel ?? null,
    notes: next.notes ?? null,
    updatedAt,
  });
  return next;
}

async function removeMock(id: string): Promise<void> {
  mockItems.delete(id);
}

async function removeLive(id: string): Promise<void> {
  const uid = requireUid();
  await deleteDoc(doc(requireDb(), 'users', uid, 'cycleItems', id));
}

export const cycleRepository = {
  listItems(): Promise<CycleItem[]> {
    return shouldUseMockServices() ? listMock() : listLive();
  },

  addItem(input: CycleItemInput): Promise<CycleItem> {
    return shouldUseMockServices() ? addMock(input) : addLive(input);
  },

  updateItem(id: string, patch: Partial<CycleItemInput>): Promise<CycleItem> {
    return shouldUseMockServices()
      ? updateMock(id, patch)
      : updateLive(id, patch);
  },

  deleteItem(id: string): Promise<void> {
    return shouldUseMockServices() ? removeMock(id) : removeLive(id);
  },
};
