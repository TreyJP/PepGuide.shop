import { isPreferredPartner } from '@/src/data/affiliates/preferred-partners';
import {
  ALASKA_LABS_CATALOG,
  ALASKA_LABS_PARTNER,
} from '@/src/data/affiliates/alaska-labs-catalog';
import {
  AMP_PEPTIDES_CATALOG,
  AMP_PEPTIDES_PARTNER,
} from '@/src/data/affiliates/amp-peptides-catalog';
import {
  ELYTRA_LABS_CATALOG,
  ELYTRA_LABS_PARTNER,
} from '@/src/data/affiliates/elytra-labs-catalog';
import {
  NEUROLABS_CATALOG,
  NEUROLABS_PARTNER,
} from '@/src/data/affiliates/neurolabs-catalog';
import {
  PRISTINE_PEPTIDE_CATALOG,
  PRISTINE_PEPTIDE_PARTNER,
} from '@/src/data/affiliates/pristine-peptide-catalog';
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
import type { PartnerProduct } from '@/src/types/affiliates';

export type SeoVendor = {
  slug: string;
  name: string;
  website: string;
  summary: string;
  discountLabel: string;
  couponCode: string;
  trustedPartner: boolean;
  catalogCount: number;
  productNames: string[];
};

type PartnerBundle = {
  partner: {
    id: string;
    label: string;
    href: string;
    couponCode: string;
    discountLabel: string;
  };
  catalog: PartnerProduct[];
  summary: string;
};

const VENDOR_BUNDLES: PartnerBundle[] = [
  {
    partner: REFINED_BIOLABS_PARTNER,
    catalog: REFINED_BIOLABS_CATALOG,
    summary:
      'PepGuide partner catalog with disclosed discount tracking. Review product pages and any lot documentation directly with the vendor.',
  },
  {
    partner: ALASKA_LABS_PARTNER,
    catalog: ALASKA_LABS_CATALOG,
    summary:
      'PepGuide partner listing. Confirm testing documents, shipping policies, and product details on the vendor site.',
  },
  {
    partner: VITALCHEMS_PARTNER,
    catalog: VITALCHEMS_CATALOG,
    summary:
      'Third-party vendor catalog surfaced for research discovery. PepGuide does not manufacture these products.',
  },
  {
    partner: SOMACHEMS_PARTNER,
    catalog: SOMACHEMS_CATALOG,
    summary:
      'Partner storefront linked from PepGuide comparisons. Verify current policies and documentation on the merchant site.',
  },
  {
    partner: AMP_PEPTIDES_PARTNER,
    catalog: AMP_PEPTIDES_CATALOG,
    summary:
      'Affiliate partner catalog for educational price discovery. Not a medical endorsement.',
  },
  {
    partner: ELYTRA_LABS_PARTNER,
    catalog: ELYTRA_LABS_CATALOG,
    summary:
      'Partner catalog with affiliate tracking parameters. Evaluate claims and documents independently.',
  },
  {
    partner: NEUROLABS_PARTNER,
    catalog: NEUROLABS_CATALOG,
    summary:
      'Research supplier listing on PepGuide. Confirm lot-level documentation with the vendor when needed.',
  },
  {
    partner: PRISTINE_PEPTIDE_PARTNER,
    catalog: PRISTINE_PEPTIDE_CATALOG,
    summary:
      'Partner listing for catalog discovery. PepGuide does not invent purity scores or certifications.',
  },
];

export function getSeoVendors(): SeoVendor[] {
  return VENDOR_BUNDLES.map(({ partner, catalog, summary }) => ({
    slug: partner.id,
    name: partner.label,
    website: partner.href,
    summary,
    discountLabel: partner.discountLabel,
    couponCode: partner.couponCode,
    trustedPartner: isPreferredPartner(partner.id, partner.label),
    catalogCount: catalog.length,
    productNames: [...new Set(catalog.map((p) => p.name))].slice(0, 24),
  })).sort((a, b) => Number(b.trustedPartner) - Number(a.trustedPartner) || a.name.localeCompare(b.name));
}

export function getSeoVendorBySlug(slug: string): SeoVendor | undefined {
  return getSeoVendors().find((v) => v.slug === slug);
}
