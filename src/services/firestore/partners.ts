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

import { DEFAULT_AFFILIATE_COUPON } from '@/src/constants/affiliates';
import {
  PARTNER_LAB_TESTS,
  type PartnerLabTestId,
} from '@/src/data/affiliates/lab-tests';
import {
  NEUROLABS_CATALOG,
  NEUROLABS_PARTNER,
} from '@/src/data/affiliates/neurolabs-catalog';
import {
  PRISTINE_PEPTIDE_CATALOG,
  PRISTINE_PEPTIDE_PARTNER,
} from '@/src/data/affiliates/pristine-peptide-catalog';
import { PREFERRED_PARTNER_ID } from '@/src/data/affiliates/preferred-partners';
import {
  REFINED_BIOLABS_CATALOG,
  REFINED_BIOLABS_PARTNER,
} from '@/src/data/affiliates/refined-biolabs-catalog';
import {
  SOMACHEMS_CATALOG,
  SOMACHEMS_PARTNER,
} from '@/src/data/affiliates/somachems-catalog';
import {
  VITALCHEMS_CATALOG,
  VITALCHEMS_PARTNER,
} from '@/src/data/affiliates/vitalchems-catalog';
import {
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import type {
  AffiliatePartner,
  AffiliatePartnerInput,
  PartnerProduct,
  PartnerTestAmount,
} from '@/src/types/affiliates';
import { createId } from '@/src/utils/dates';

const FAKE_SLOT_IDS = new Set(['slot-a', 'slot-b', 'slot-c', 'slot-d']);

type CatalogPartnerDef = {
  id: string;
  label: string;
  href: string;
  couponCode: string;
  discountLabel: string;
  discountPercent?: number;
  sortOrder: number;
  products: PartnerProduct[];
};

const CATALOG_PARTNERS: CatalogPartnerDef[] = [
  {
    ...REFINED_BIOLABS_PARTNER,
    sortOrder: 0,
    products: REFINED_BIOLABS_CATALOG,
  },
  {
    ...SOMACHEMS_PARTNER,
    sortOrder: 1,
    products: SOMACHEMS_CATALOG,
  },
  {
    ...NEUROLABS_PARTNER,
    sortOrder: 2,
    products: NEUROLABS_CATALOG,
  },
  {
    ...PRISTINE_PEPTIDE_PARTNER,
    sortOrder: 3,
    products: PRISTINE_PEPTIDE_CATALOG,
  },
  {
    ...VITALCHEMS_PARTNER,
    sortOrder: 4,
    products: VITALCHEMS_CATALOG,
  },
];

function emptyLabTests(): Record<PartnerLabTestId, boolean | null> {
  return Object.fromEntries(
    PARTNER_LAB_TESTS.map((test) => [test.id, null]),
  ) as Record<PartnerLabTestId, boolean | null>;
}

function defaultLabTests(): Record<PartnerLabTestId, boolean | null> {
  const labTests = emptyLabTests();
  labTests.net_content = true;
  labTests.net_purity = true;
  labTests.identification = true;
  labTests.endotoxins = true;
  labTests.sterility = true;
  labTests.heavy_metals = null;
  labTests.fentanyl = null;
  return labTests;
}

/** Partners that always show a complete 7/7 COA panel. */
const FULL_LAB_PANEL_PARTNER_IDS = new Set<string>([
  PREFERRED_PARTNER_ID,
  'vitalchems',
]);

/** Full COA panel (all seven checks passed). */
function fullLabTests(): Record<PartnerLabTestId, boolean | null> {
  const labTests = emptyLabTests();
  for (const test of PARTNER_LAB_TESTS) {
    labTests[test.id] = true;
  }
  return labTests;
}

/** NeuroLabs public panel: LC-MS, HPLC-UV, quant, LAL, PCR microbial, fentanyl. */
function neurolabsLabTests(): Record<PartnerLabTestId, boolean | null> {
  return {
    ...emptyLabTests(),
    identification: true, // Identity · LC-MS
    net_purity: true, // Purity · HPLC-UV >99%
    net_content: true, // Net content · Quantitation
    endotoxins: true, // Endotoxin · LAL USP <85>
    sterility: true, // Microbial · PCR
    fentanyl: true, // Fentanyl screen · confirmed negative
    heavy_metals: null, // Not listed on their public panel
  };
}

function catalogLabTests(
  partnerId: string,
): Record<PartnerLabTestId, boolean | null> | null {
  if (FULL_LAB_PANEL_PARTNER_IDS.has(partnerId)) return fullLabTests();
  if (partnerId === 'neurolabs') return neurolabsLabTests();
  return null;
}

function labTestsForPartner(
  partnerId: string,
): Record<PartnerLabTestId, boolean | null> {
  return catalogLabTests(partnerId) ?? defaultLabTests();
}

function buildCatalogPartner(
  def: CatalogPartnerDef,
  now = new Date().toISOString(),
): AffiliatePartner {
  return {
    id: def.id,
    label: def.label,
    href: def.href,
    active: true,
    sortOrder: def.sortOrder,
    couponCode: def.couponCode,
    discountLabel: def.discountLabel,
    testAmounts: [],
    products: def.products.map((product) => ({ ...product })),
    labTests: labTestsForPartner(def.id),
    createdAt: now,
    updatedAt: now,
  };
}

function seedPartners(): AffiliatePartner[] {
  return CATALOG_PARTNERS.map((def) => buildCatalogPartner(def));
}

let mockPartners = seedPartners();
let mockAdminEmails: string[] = [];

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function mapProducts(raw: unknown): PartnerProduct[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item as Record<string, unknown>;
      const peptideIds = Array.isArray(row.peptideIds)
        ? row.peptideIds.map((id) => String(id))
        : [];
      const priceRaw = row.priceUsd;
      const priceUsd =
        priceRaw === null || priceRaw === undefined
          ? null
          : Number(priceRaw);
      return {
        id: String(row.id ?? createId('product')),
        name: String(row.name ?? 'Product'),
        peptideIds,
        priceUsd: Number.isFinite(priceUsd as number) ? (priceUsd as number) : null,
        priceMaxUsd:
          row.priceMaxUsd === null || row.priceMaxUsd === undefined
            ? null
            : Number(row.priceMaxUsd) || null,
        testAmount:
          typeof row.testAmount === 'string' ? row.testAmount : 'Standard',
        href: typeof row.href === 'string' ? row.href : undefined,
      } satisfies PartnerProduct;
    })
    .filter((product) => product.peptideIds.length > 0);
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
    : [];

  const products = mapProducts(data.products);

  return {
    id,
    label: String(data.label ?? 'Partner'),
    href: String(data.href ?? '#'),
    active: data.active !== false,
    sortOrder: Number(data.sortOrder ?? 0),
    couponCode:
      typeof data.couponCode === 'string' && data.couponCode.trim()
        ? data.couponCode.trim()
        : DEFAULT_AFFILIATE_COUPON.code,
    discountLabel:
      typeof data.discountLabel === 'string' && data.discountLabel.trim()
        ? data.discountLabel.trim()
        : DEFAULT_AFFILIATE_COUPON.discountLabel,
    testAmounts: rawAmounts.map((item) => ({
      testAmount: String(item.testAmount),
      priceUsd: Number(item.priceUsd) || 0,
    })),
    products,
    labTests,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

function partnersCol() {
  return collection(requireDb(), 'affiliatePartners');
}

async function syncCatalogPartnerLive(def: CatalogPartnerDef): Promise<void> {
  const db = requireDb();
  const ref = doc(db, 'affiliatePartners', def.id);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();
  const next = buildCatalogPartner(def, now);

  if (existing.exists()) {
    const current = mapPartner(def.id, existing.data() as Record<string, unknown>);
    const preferred = def.id === PREFERRED_PARTNER_ID;
    const forcedLabs = catalogLabTests(def.id);
    await setDoc(ref, {
      ...next,
      createdAt: current.createdAt,
      // Forced catalog panels stay in sync (e.g. 7/7 or NeuroLabs 6/7).
      labTests: forcedLabs ?? current.labTests,
      active: current.active,
      sortOrder: preferred ? next.sortOrder : (current.sortOrder ?? next.sortOrder),
      couponCode: preferred
        ? next.couponCode
        : current.couponCode || next.couponCode,
      discountLabel: preferred
        ? next.discountLabel
        : current.discountLabel || next.discountLabel,
      href: current.href || next.href,
      updatedAt: now,
    });
    return;
  }

  await setDoc(ref, next);
}

async function syncCatalogPartnersLive(): Promise<void> {
  const snap = await getDocs(partnersCol());
  await Promise.all(
    snap.docs
      .filter((item) => FAKE_SLOT_IDS.has(item.id))
      .map((item) => deleteDoc(item.ref)),
  );
  await Promise.all(CATALOG_PARTNERS.map((def) => syncCatalogPartnerLive(def)));
}

async function listMock(): Promise<AffiliatePartner[]> {
  const catalogIds = new Set(CATALOG_PARTNERS.map((def) => def.id));
  const custom = mockPartners.filter(
    (partner) =>
      !FAKE_SLOT_IDS.has(partner.id) && !catalogIds.has(partner.id),
  );

  mockPartners = [
    ...CATALOG_PARTNERS.map((def) => {
      const existing = mockPartners.find((partner) => partner.id === def.id);
      if (!existing) return buildCatalogPartner(def);
      const next = buildCatalogPartner(def, existing.createdAt);
      const preferred = def.id === PREFERRED_PARTNER_ID;
      const forcedLabs = catalogLabTests(def.id);
      return {
        ...next,
        labTests: forcedLabs ?? existing.labTests,
        active: existing.active,
        couponCode: preferred ? next.couponCode : existing.couponCode,
        discountLabel: preferred ? next.discountLabel : existing.discountLabel,
        href: existing.href,
      };
    }),
    ...custom,
  ];

  return [...mockPartners].sort((a, b) => a.sortOrder - b.sortOrder);
}

async function listLive(): Promise<AffiliatePartner[]> {
  // Catalog sync writes docs — non-admins can't write. Never let that
  // block listing partners for the rest of the app.
  try {
    await syncCatalogPartnersLive();
  } catch {
    // Read-only clients still get whatever is already in Firestore.
  }

  const snap = await getDocs(query(partnersCol(), orderBy('sortOrder', 'asc')));
  if (snap.empty) {
    // Seed only works for admins; otherwise fall back to offline catalogs.
    try {
      const seeded = seedPartners();
      await Promise.all(
        seeded.map((partner) =>
          setDoc(doc(requireDb(), 'affiliatePartners', partner.id), partner),
        ),
      );
      return seeded;
    } catch {
      return CATALOG_PARTNERS.map((def) => buildCatalogPartner(def));
    }
  }

  const live = snap.docs
    .map((item) => mapPartner(item.id, item.data() as Record<string, unknown>))
    .filter((partner) => !FAKE_SLOT_IDS.has(partner.id));

  // If Firestore only has inactive/hidden rows, still expose catalog vendors
  // so review/pricing UIs have something to show.
  if (live.length === 0) {
    return CATALOG_PARTNERS.map((def) => buildCatalogPartner(def));
  }

  return live;
}

/** Offline / catalog vendor names for UIs that need a vendor picker. */
export function listCatalogVendorOptions(): Array<{ id: string; label: string }> {
  return CATALOG_PARTNERS.map((def) => ({ id: def.id, label: def.label }));
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
      couponCode: input.couponCode?.trim() || existing.couponCode,
      discountLabel: input.discountLabel?.trim() || existing.discountLabel,
      testAmounts: input.testAmounts ?? existing.testAmounts,
      products: input.products ?? existing.products,
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
    couponCode: input.couponCode?.trim() || DEFAULT_AFFILIATE_COUPON.code,
    discountLabel:
      input.discountLabel?.trim() || DEFAULT_AFFILIATE_COUPON.discountLabel,
    testAmounts: input.testAmounts ?? [],
    products: input.products ?? [],
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
      couponCode: input.couponCode?.trim() || current.couponCode,
      discountLabel: input.discountLabel?.trim() || current.discountLabel,
      testAmounts: input.testAmounts ?? current.testAmounts,
      products: input.products ?? current.products,
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
    couponCode: input.couponCode?.trim() || DEFAULT_AFFILIATE_COUPON.code,
    discountLabel:
      input.discountLabel?.trim() || DEFAULT_AFFILIATE_COUPON.discountLabel,
    testAmounts: input.testAmounts ?? [],
    products: input.products ?? [],
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
