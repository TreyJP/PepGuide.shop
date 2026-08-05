import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { createId } from '@/src/lib/utils';
import { buildAdminDashboardMetrics } from '@/src/lib/admin-metrics';
import {
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import type {
  AdminDashboardMetrics,
  AnalyticsEvent,
  AnalyticsEventName,
} from '@/src/types/analytics';
import { analyticsService } from '@/src/services/analytics';

type TrackInput = {
  name: AnalyticsEventName;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

let mockEvents: AnalyticsEvent[] = [];

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured.');
  return db;
}

function cleanMeta(
  meta?: TrackInput['meta'],
): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  if (!meta) return out;
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

function toAnalyticsParams(
  meta: Record<string, string | number | boolean | null>,
  extra?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries({ ...meta, ...extra })) {
    if (value == null) continue;
    out[key] = value;
  }
  return out;
}

function mapEventDoc(
  id: string,
  data: Record<string, unknown>,
): AnalyticsEvent {
  return {
    id,
    name: String(data.name ?? 'affiliate_click') as AnalyticsEventName,
    createdAt:
      typeof data.createdAt === 'string'
        ? data.createdAt
        : new Date().toISOString(),
    userId: typeof data.userId === 'string' ? data.userId : null,
    email: typeof data.email === 'string' ? data.email : null,
    path: typeof data.path === 'string' ? data.path : null,
    meta:
      data.meta && typeof data.meta === 'object'
        ? (data.meta as Record<string, string | number | boolean | null>)
        : {},
  };
}

async function trackLive(input: TrackInput): Promise<void> {
  const user = useAuthStore.getState().user;
  const createdAt = new Date().toISOString();
  const payload = {
    name: input.name,
    createdAt,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    path: typeof window !== 'undefined' ? window.location.pathname : null,
    meta: cleanMeta(input.meta),
    // serverTimestamp kept for ordering backups if needed
    serverCreatedAt: serverTimestamp(),
  };

  await addDoc(collection(requireDb(), 'analyticsEvents'), payload);
  analyticsService.logEvent(
    input.name,
    toAnalyticsParams(cleanMeta(input.meta), { userId: user?.id }),
  );
}

async function trackMock(input: TrackInput): Promise<void> {
  const user = useAuthStore.getState().user;
  mockEvents.unshift({
    id: createId('evt'),
    name: input.name,
    createdAt: new Date().toISOString(),
    userId: user?.id ?? null,
    email: user?.email ?? null,
    path: typeof window !== 'undefined' ? window.location.pathname : null,
    meta: cleanMeta(input.meta),
  });
  analyticsService.logEvent(
    input.name,
    toAnalyticsParams(cleanMeta(input.meta)),
  );
}

export async function trackAnalyticsEvent(input: TrackInput): Promise<void> {
  try {
    if (shouldUseMockServices()) {
      await trackMock(input);
      return;
    }
    await trackLive(input);
  } catch (error) {
    console.warn('Analytics track failed', error);
  }
}

async function loadEventsLive(max = 1000): Promise<AnalyticsEvent[]> {
  const snap = await getDocs(
    query(
      collection(requireDb(), 'analyticsEvents'),
      orderBy('createdAt', 'desc'),
      limit(max),
    ),
  );
  return snap.docs.map((docSnap) =>
    mapEventDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
}

async function loadUsersLive() {
  const snap = await getDocs(collection(requireDb(), 'users'));
  return snap.docs.map((docSnap) => docSnap.data() as Record<string, unknown>);
}

async function loadSafetyLive() {
  const snap = await getDocs(
    query(
      collection(requireDb(), 'safetyEvents'),
      orderBy('createdAt', 'desc'),
      limit(500),
    ),
  );
  return snap.docs.map((docSnap) => docSnap.data() as Record<string, unknown>);
}

async function loadUsageLive(): Promise<
  Array<{ id: string; messagesUsed?: number; updatedAt?: string }>
> {
  // Collection group would be ideal; fall back to empty if unsupported.
  try {
    const { collectionGroup } = await import('firebase/firestore');
    const snap = await getDocs(
      query(collectionGroup(requireDb(), 'periods'), limit(2000)),
    );
    return snap.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      return {
        id: docSnap.id,
        messagesUsed:
          typeof data.messagesUsed === 'number' ? data.messagesUsed : 0,
        updatedAt:
          typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
      };
    });
  } catch {
    return [];
  }
}

async function loadPartnersLive(): Promise<
  Array<{ id: string; label?: string; active?: boolean }>
> {
  const snap = await getDocs(collection(requireDb(), 'affiliatePartners'));
  return snap.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    return {
      id: docSnap.id,
      label: typeof data.label === 'string' ? data.label : docSnap.id,
      active: data.active !== false,
    };
  });
}

function mockMetrics(): AdminDashboardMetrics {
  return buildAdminDashboardMetrics({
    users: [
      {
        createdAt: new Date().toISOString(),
        subscriptionTier: 'pro',
        accountStatus: 'active',
        stripeSubscriptionId: 'sub_mock',
      },
      {
        createdAt: daysAgo(3),
        subscriptionTier: 'free',
        accountStatus: 'active',
      },
      {
        createdAt: daysAgo(20),
        subscriptionTier: 'free',
        accountStatus: 'review',
        abuseStrikeCount: 2,
      },
    ],
    events: mockEvents.length
      ? mockEvents
      : [
          {
            id: 'evt_1',
            name: 'affiliate_click',
            createdAt: new Date().toISOString(),
            userId: 'u1',
            email: 'demo@pepguide.shop',
            path: '/chat',
            meta: {
              partnerId: 'somachems',
              partnerLabel: 'SomaChems',
              peptideId: 'retatrutide',
              peptideName: 'Retatrutide',
            },
          },
        ],
    usagePeriods: [
      { id: new Date().toISOString().slice(0, 10), messagesUsed: 12 },
      { id: daysAgo(1).slice(0, 10), messagesUsed: 8 },
    ],
    safetyEvents: [{ createdAt: daysAgo(1) }],
    partners: [
      { id: 'somachems', label: 'SomaChems', active: true },
      { id: 'neurolabs', label: 'NeuroLabs', active: true },
    ],
  });
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function loadAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  if (shouldUseMockServices()) {
    return mockMetrics();
  }

  const [users, events, safetyEvents, usagePeriods, partners] =
    await Promise.all([
      loadUsersLive(),
      loadEventsLive(),
      loadSafetyLive().catch(() => []),
      loadUsageLive().catch(() => []),
      loadPartnersLive().catch(() => []),
    ]);

  return buildAdminDashboardMetrics({
    users: users.map((row) => ({
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : undefined,
      subscriptionTier:
        typeof row.subscriptionTier === 'string'
          ? row.subscriptionTier
          : undefined,
      accountStatus:
        typeof row.accountStatus === 'string' ? row.accountStatus : undefined,
      chatBlockedUntil:
        typeof row.chatBlockedUntil === 'string' ? row.chatBlockedUntil : null,
      abuseStrikeCount:
        typeof row.abuseStrikeCount === 'number' ? row.abuseStrikeCount : 0,
      stripeSubscriptionId:
        typeof row.stripeSubscriptionId === 'string'
          ? row.stripeSubscriptionId
          : null,
      stripeCustomerId:
        typeof row.stripeCustomerId === 'string' ? row.stripeCustomerId : null,
    })),
    events,
    usagePeriods,
    safetyEvents: safetyEvents.map((row) => ({
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : undefined,
    })),
    partners,
  });
}
