import type { PartnerLabTestId } from '@/src/data/affiliates/lab-tests';

export type PartnerTestAmount = {
  testAmount: string;
  priceUsd: number;
};

export type AffiliatePartner = {
  id: string;
  label: string;
  href: string;
  active: boolean;
  sortOrder: number;
  /** Vial sizes this partner stocks, with placeholder prices. */
  testAmounts: PartnerTestAmount[];
  labTests: Record<PartnerLabTestId, boolean | null>;
  createdAt: string;
  updatedAt: string;
};

export type AffiliatePartnerInput = {
  label: string;
  href?: string;
  active?: boolean;
  sortOrder?: number;
  testAmounts?: PartnerTestAmount[];
  labTests?: Partial<Record<PartnerLabTestId, boolean | null>>;
};
