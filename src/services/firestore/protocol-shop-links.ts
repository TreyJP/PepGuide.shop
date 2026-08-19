import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/src/services/firebase/config';
import type {
  ProtocolShopLink,
  ProtocolShopLinksDoc,
} from '@/src/types/protocol-shop-links';
import { createId } from '@/src/utils/dates';

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function col() {
  return collection(requireDb(), 'protocolShopLinks');
}

function sanitizeHref(value: string): string {
  const href = value.trim();
  if (!href) return '';
  try {
    const url = new URL(href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

function mapDoc(
  protocolId: string,
  data: Record<string, unknown>,
): ProtocolShopLinksDoc {
  const rawLinks = Array.isArray(data.links) ? data.links : [];
  const links: ProtocolShopLink[] = [];
  for (const item of rawLinks) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const href = sanitizeHref(String(row.href ?? ''));
    if (!href) continue;
    links.push({
      id: typeof row.id === 'string' && row.id.trim() ? row.id.trim() : createId('psl'),
      href,
      label:
        typeof row.label === 'string' && row.label.trim()
          ? row.label.trim()
          : 'Shop this stack',
    });
  }

  return {
    protocolId,
    links,
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

export const protocolShopLinksRepository = {
  async list(): Promise<ProtocolShopLinksDoc[]> {
    const snap = await getDocs(col());
    return snap.docs.map((item) =>
      mapDoc(item.id, item.data() as Record<string, unknown>),
    );
  },

  async getByProtocolId(
    protocolId: string,
  ): Promise<ProtocolShopLinksDoc | null> {
    if (!protocolId) return null;
    const snap = await getDoc(doc(requireDb(), 'protocolShopLinks', protocolId));
    if (!snap.exists()) return null;
    return mapDoc(snap.id, snap.data() as Record<string, unknown>);
  },

  async save(
    protocolId: string,
    links: Array<{ id?: string; href: string; label?: string }>,
  ): Promise<ProtocolShopLinksDoc> {
    if (!protocolId) throw new Error('Protocol is required.');
    const cleaned: ProtocolShopLink[] = [];
    for (const item of links) {
      const href = sanitizeHref(item.href);
      if (!href) continue;
      cleaned.push({
        id: item.id?.trim() || createId('psl'),
        href,
        label: item.label?.trim() || 'Shop this stack',
      });
    }

    const payload = {
      protocolId,
      links: cleaned,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(requireDb(), 'protocolShopLinks', protocolId), payload, {
      merge: true,
    });
    return mapDoc(protocolId, payload);
  },

  async remove(protocolId: string): Promise<void> {
    await deleteDoc(doc(requireDb(), 'protocolShopLinks', protocolId));
  },
};
