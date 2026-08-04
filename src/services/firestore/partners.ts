import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  PARTNER_LAB_TESTS,
  type PartnerLabTestId,
} from '@/src/data/affiliates/lab-tests';
import { VIAL_TEST_AMOUNTS } from '@/src/data/affiliates/slots';
import {
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import type {
  AffiliatePartner,
  AffiliatePartnerInput,
  PartnerTestAmount,
} from '@/src/types/affiliates';
import { createId } from '@/src/utils/dates';

function emptyLabTests(): Record<PartnerLabTestId, boolean | null> {
  return Object.fromEntries(
    PARTNER_LAB_TESTS.map((test) => [test.id, null]),
  ) as Record<PartnerLabTestId, boolean | null>;
}

function defaultTestAmounts(): PartnerTestAmount[] {
  return VIAL_TEST_AMOUNTS.map((testAmount, index) => ({
    testAmount,
    priceUsd: 40 + index * 18,
  }));
}

function seedPartners(): AffiliatePartner[] {
  const now = new Date().toISOString();
  const seeds: Array<{
    id: string;
    label: string;
    labs: Array<boolean | null>;
    priceBase: number;
  }> = [
    {
      id: 'slot-a',
      label: 'Partner Slot A',
      labs: [true, true, true, true, true, null, true],
      priceBase: 48,
    },
    {
      id: 'slot-b',
      label: 'Partner Slot B',
      labs: [true, true, null, null, null, null, null],
      priceBase: 42,
    },
    {
      id: 'slot-c',
      label: 'Partner Slot C',
      labs: [null, null, null, null, null, null, null],
      priceBase: 38,
    },
    {
      id: 'slot-d',
      label: 'Partner Slot D',
      labs: [true, true, true, true, true, true, true],
      priceBase: 55,
    },
  ];

  return seeds.map((seed, index) => {
    const labTests = emptyLabTests();
    PARTNER_LAB_TESTS.forEach((test, i) => {
      labTests[test.id] = seed.labs[i] ?? null;
    });
    return {
      id: seed.id,
      label: seed.label,
      href: '#',
      active: true,
      sortOrder: index,
      testAmounts: VIAL_TEST_AMOUNTS.map((testAmount, amountIndex) => ({
        testAmount,
        priceUsd: seed.priceBase + amountIndex * 16,
      })),
      labTests,
      createdAt: now,
      updatedAt: now,
    };
  });
}

let mockPartners = seedPartners();
let mockAdminEmails: string[] = [];

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function mapPartner(id: string, data: Record<string, unknown>): AffiliatePartner {
  const labTests = emptyLabTests();
  const rawLabs = (data.labTests as Record<string, boolean | null> | undefined) ?? {};
  for (const test of PARTNER_LAB_TESTS) {
    labTests[test.id] =
      rawLabs[test.id] === true || rawLabs[test.id] === false
        ? rawLabs[test.id]
        : null;
  }

  const rawAmounts = Array.isArray(data.testAmounts)
    ? (data.testAmounts as PartnerTestAmount[])
    : defaultTestAmounts();

  return {
    id,
    label: String(data.label ?? 'Partner'),
    href: String(data.href ?? '#'),
    active: data.active !== false,
    sortOrder: Number(data.sortOrder ?? 0),
    testAmounts: rawAmounts.map((item) => ({
      testAmount: String(item.testAmount),
      priceUsd: Number(item.priceUsd) || 0,
    })),
    labTests,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

function partnersCol() {
  return collection(requireDb(), 'affiliatePartners');
}

async function listMock(): Promise<AffiliatePartner[]> {
  return [...mockPartners].sort((a, b) => a.sortOrder - b.sortOrder);
}

async function listLive(): Promise<AffiliatePartner[]> {
  const snap = await getDocs(query(partnersCol(), orderBy('sortOrder', 'asc')));
  if (snap.empty) {
    // First load: seed placeholder partners so the shop isn’t empty.
    const seeded = seedPartners();
    await Promise.all(
      seeded.map((partner) =>
        setDoc(doc(requireDb(), 'affiliatePartners', partner.id), partner),
      ),
    );
    return seeded;
  }
  return snap.docs.map((item) =>
    mapPartner(item.id, item.data() as Record<string, unknown>),
  );
}

async function upsertMock(
  id: string | null,
  input: AffiliatePartnerInput,
): Promise<AffiliatePartner> {
  const now = new Date().toISOString();
  if (id) {
    const existing = mockPartners.find((partner) => partner.id === id);
    if (!existing) throw new Error('Partner not found');
    const updated: AffiliatePartner = {
      ...existing,
      label: input.label.trim(),
      href: input.href?.trim() || existing.href,
      active: input.active ?? existing.active,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      testAmounts: input.testAmounts ?? existing.testAmounts,
      labTests: { ...existing.labTests, ...input.labTests },
      updatedAt: now,
    };
    mockPartners = mockPartners.map((partner) =>
      partner.id === id ? updated : partner,
    );
    return updated;
  }

  const partner: AffiliatePartner = {
    id: createId('partner'),
    label: input.label.trim(),
    href: input.href?.trim() || '#',
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? mockPartners.length,
    testAmounts: input.testAmounts?.length
      ? input.testAmounts
      : defaultTestAmounts(),
    labTests: { ...emptyLabTests(), ...input.labTests },
    createdAt: now,
    updatedAt: now,
  };
  mockPartners = [...mockPartners, partner];
  return partner;
}

async function upsertLive(
  id: string | null,
  input: AffiliatePartnerInput,
): Promise<AffiliatePartner> {
  const db = requireDb();
  const now = new Date().toISOString();

  if (id) {
    const ref = doc(db, 'affiliatePartners', id);
    const existing = await getDoc(ref);
    if (!existing.exists()) throw new Error('Partner not found');
    const current = mapPartner(id, existing.data() as Record<string, unknown>);
    const updated: AffiliatePartner = {
      ...current,
      label: input.label.trim(),
      href: input.href?.trim() || current.href,
      active: input.active ?? current.active,
      sortOrder: input.sortOrder ?? current.sortOrder,
      testAmounts: input.testAmounts ?? current.testAmounts,
      labTests: { ...current.labTests, ...input.labTests },
      updatedAt: now,
    };
    await updateDoc(ref, { ...updated });
    return updated;
  }

  const partnerId = createId('partner');
  const partner: AffiliatePartner = {
    id: partnerId,
    label: input.label.trim(),
    href: input.href?.trim() || '#',
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? Date.now(),
    testAmounts: input.testAmounts?.length
      ? input.testAmounts
      : defaultTestAmounts(),
    labTests: { ...emptyLabTests(), ...input.labTests },
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'affiliatePartners', partnerId), partner);
  return partner;
}

async function removeMock(id: string): Promise<void> {
  mockPartners = mockPartners.filter((partner) => partner.id !== id);
}

async function removeLive(id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'affiliatePartners', id));
}

async function getAdminEmailsMock(): Promise<string[]> {
  return [...mockAdminEmails];
}

async function getAdminEmailsLive(): Promise<string[]> {
  const snap = await getDoc(doc(requireDb(), 'config', 'admins'));
  if (!snap.exists()) return [];
  const emails = snap.data().emails;
  return Array.isArray(emails)
    ? emails.map((email) => String(email).toLowerCase())
    : [];
}

async function setAdminEmailsMock(emails: string[]): Promise<string[]> {
  mockAdminEmails = [
    ...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean)),
  ];
  return mockAdminEmails;
}

async function setAdminEmailsLive(emails: string[]): Promise<string[]> {
  const normalized = [
    ...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean)),
  ];
  await setDoc(
    doc(requireDb(), 'config', 'admins'),
    { emails: normalized, updatedAt: new Date().toISOString() },
    { merge: true },
  );
  return normalized;
}

export const partnersRepository = {
  listPartners(): Promise<AffiliatePartner[]> {
    return shouldUseMockServices() ? listMock() : listLive();
  },

  upsertPartner(
    id: string | null,
    input: AffiliatePartnerInput,
  ): Promise<AffiliatePartner> {
    return shouldUseMockServices() ? upsertMock(id, input) : upsertLive(id, input);
  },

  deletePartner(id: string): Promise<void> {
    return shouldUseMockServices() ? removeMock(id) : removeLive(id);
  },

  getAdminEmails(): Promise<string[]> {
    return shouldUseMockServices() ? getAdminEmailsMock() : getAdminEmailsLive();
  },

  setAdminEmails(emails: string[]): Promise<string[]> {
    return shouldUseMockServices()
      ? setAdminEmailsMock(emails)
      : setAdminEmailsLive(emails);
  },

  async isAllowlistedAdmin(email: string): Promise<boolean> {
    const emails = await this.getAdminEmails();
    return emails.includes(email.trim().toLowerCase());
  },
};
