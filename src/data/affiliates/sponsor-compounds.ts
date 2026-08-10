import { NEUROLABS_CATALOG } from '@/src/data/affiliates/neurolabs-catalog';
import { PRISTINE_PEPTIDE_CATALOG } from '@/src/data/affiliates/pristine-peptide-catalog';
import { REFINED_BIOLABS_CATALOG } from '@/src/data/affiliates/refined-biolabs-catalog';
import { SOMACHEMS_CATALOG } from '@/src/data/affiliates/somachems-catalog';
import { VITALCHEMS_CATALOG } from '@/src/data/affiliates/vitalchems-catalog';
import type { PartnerProduct } from '@/src/types/affiliates';

const SPONSOR_CATALOGS: PartnerProduct[][] = [
  SOMACHEMS_CATALOG,
  NEUROLABS_CATALOG,
  PRISTINE_PEPTIDE_CATALOG,
  REFINED_BIOLABS_CATALOG,
  VITALCHEMS_CATALOG,
];

/** Every compound ID referenced by any sponsor catalog product. */
export function getSponsorCompoundIds(): Set<string> {
  const ids = new Set<string>();
  for (const catalog of SPONSOR_CATALOGS) {
    for (const product of catalog) {
      for (const peptideId of product.peptideIds) {
        ids.add(peptideId);
      }
    }
  }
  return ids;
}

/**
 * Extra Library search aliases from sponsor product titles
 * (e.g. "GLP-3 (RET)" → retatrutide searchable as "GLP-3" / "RET").
 */
export function getSponsorSearchAliasesByCompoundId(): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const catalog of SPONSOR_CATALOGS) {
    for (const product of catalog) {
      for (const peptideId of product.peptideIds) {
        const aliases = map.get(peptideId) ?? [];
        aliases.push(product.name);

        const paren = product.name.match(/\(([^)]+)\)/);
        const parenValue = paren?.[1]?.trim() ?? '';
        // Keep codes like RET / TRZ / SEM — skip vial sizes like "5–40MG".
        if (
          parenValue &&
          /[a-z]/i.test(parenValue) &&
          !/^\d/.test(parenValue) &&
          !/\bmg\b/i.test(parenValue)
        ) {
          aliases.push(parenValue);
        }

        const withoutParen = product.name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
        if (
          withoutParen &&
          withoutParen !== product.name &&
          withoutParen.length >= 2
        ) {
          aliases.push(withoutParen);
        }

        map.set(peptideId, aliases);
      }
    }
  }

  for (const [id, aliases] of map) {
    map.set(
      id,
      [...new Set(aliases.map((alias) => alias.trim()).filter(Boolean))],
    );
  }

  return map;
}
