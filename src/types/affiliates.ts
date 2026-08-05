import type { PartnerLabTestId } from '@/src/data/affiliates/lab-tests';

export type PartnerTestAmount = {
  testAmount: string;
  priceUsd: number;
};

/** Per-compound catalog row for a partner (preferred over global vial prices). */
export type PartnerProduct = {
  id: string;
  name: string;
  /** Compound IDs whose pricing modal should include this product. */
  peptideIds: string[];
  /** Null = contact / read more (not shown as a priced offer). */
  priceUsd: number | null;
  priceMaxUsd?: number | null;
  testAmount?: string;
  href?: string;
};

export type AffiliatePartner = {
  id: string;
  label: string;
  href: string;
  active: boolean;
  sortOrder: number;
  /** PepGuide discount code for this partner’s checkout. */
  couponCode: string;
  /** Human label, e.g. "10% off". */
  discountLabel: string;
  /**
   * Legacy global vial sizes. Used only when `products` is empty for a partner.
   * @deprecated Prefer `products` for real catalogs.
   */
  testAmounts: PartnerTestAmount[];
  /** Per-peptide / per-SKU catalog. */
  products: PartnerProduct[];
  labTests: Record<PartnerLabTestId, boolean | null>;
  createdAt: string;
  updatedAt: string;
};

export type AffiliatePartnerInput = {
  label: string;
  href?: string;
  active?: boolean;
  sortOrder?: number;
  couponCode?: string;
  discountLabel?: string;
  testAmounts?: PartnerTestAmount[];
  products?: PartnerProduct[];
  labTests?: Partial<Record<PartnerLabTestId, boolean | null>>;
};
