import { KNOWLEDGE_COMPOUNDS } from './compounds';
import type { KnowledgeCompound } from './types';

/**
 * Community slang / short names for peptides.
 * Matching also auto-adds hyphenless forms of ids + aliases (bpc157, ss31, etc.).
 */
const COMPOUND_SLANG: Record<string, string[]> = {
  // Metabolic
  retatrutide: ['reta', 'retatrutide', 'glp3', 'glp-3'],
  tirzepatide: ['tirz', 'tirzepatide', 'mounjaro', 'zepbound'],
  semaglutide: ['sema', 'semaglutide', 'ozempic', 'wegovy', 'rybelsus'],
  cagrilintide: ['cag', 'cagri', 'cagrisema', 'cagri-sema'],
  amycretin: ['amycretin'],
  mazdutide: ['mazdutide', 'ibi362', 'ibi-362'],
  survodutide: ['survodutide', 'bi456906', 'bi-456906'],
  'aod-9604': ['aod', 'aod9604', 'hgh frag', 'hgh-frag', 'frag 176', '176-191'],
  'mots-c': ['mots', 'motsc', 'mots c'],
  tesamorelin: ['tesamorelin', 'egrifta', 'tesa'],

  // Healing / recovery / skin
  'bpc-157': ['bpc', 'bpc157', 'bpc 157'],
  'tb-500': ['tb500', 'tb 500', 'tb4', 'tb-4', 'thymosin beta 4', 'thymosin beta-4'],
  'ghk-cu': ['ghk', 'ghkcu', 'copper peptide', 'ghk copper'],
  'ahk-cu': ['ahk', 'ahkcu', 'ahk copper'],
  kpv: ['kpv'],
  'll-37': ['ll37', 'll 37', 'cathelicidin'],
  'ara-290': ['ara290', 'ara 290', 'cibinetide'],
  'thymosin-alpha-1': ['ta1', 'tα1', 'thymosin a1', 'thymalfasin', 'zadaxin'],

  // GH / muscle
  ipamorelin: ['ipa', 'ipamorelin'],
  'cjc-1295': ['cjc', 'cjc1295', 'cjc 1295', 'cjc no dac', 'cjc without dac'],
  'cjc-1295-dac': ['cjc dac', 'cjc with dac', 'cjc1295 dac'],
  'mod-grf-1-29': ['mod grf', 'modgrf', 'grf 1-29', 'grf1-29', 'mod-grf'],
  sermorelin: ['serm', 'sermorelin', 'geref'],
  'ghrp-2': ['ghrp2', 'ghrp 2', 'pralmorelin'],
  'ghrp-6': ['ghrp6', 'ghrp 6'],
  hexarelin: ['hexarelin', 'examorelin'],
  'igf-1-lr3': ['igf', 'igf1', 'igf-1', 'lr3', 'igf lr3', 'long r3'],
  'peg-mgf': ['mgf', 'pegmgf', 'peg mgf'],
  'follistatin-344': ['follistatin', 'fst344', 'fst-344', 'follistatin 344'],
  ghrelin: ['ghrelin', 'lenomorelin'],

  // Sexual / pigment
  'pt-141': ['pt141', 'pt 141', 'bremelanotide', 'vyleesi'],
  'melanotan-ii': ['mt2', 'mt-2', 'mt 2', 'melanotan 2', 'melanotan ii', 'melanotan'],
  'melanotan-i': ['mt1', 'mt-1', 'mt 1', 'melanotan 1', 'melanotan i', 'afamelanotide', 'scenesse'],
  'kisspeptin-10': ['kisspeptin', 'kisspeptin10', 'kp10', 'kp-10'],
  'kisspeptin-54': ['kisspeptin54', 'kp54', 'kp-54'],
  gonadorelin: ['gnrh', 'lhrh', 'gonadorelin', 'factrel'],
  hcg: ['hcg', 'pregnyl', 'novarel'],
  hmg: ['hmg', 'menotropins'],
  oxytocin: ['oxytocin'],

  // Sleep / cognitive
  dsip: ['dsip'],
  selank: ['selank', 'tp7', 'tp-7'],
  semax: ['semax'],
  adamax: ['adamax', 'nasa semax'],
  dihexa: ['dihexa', 'pnb0408', 'pnb-0408'],
  p21: ['p21', 'p021'],
  'pe-22-28': ['pe2228', 'pe 22-28', 'spadin'],

  // Longevity / mito / misc
  epitalon: ['epitalon', 'epithalon', 'epithalone', 'aedg'],
  'ss-31': ['ss31', 'ss 31', 'elamipretide', 'bendavia', 'mtp131', 'mtp-131'],
  glutathione: ['glutathione', 'gsh'],
  'foxo4-dri': ['foxo4', 'foxo4dri', 'proxofim'],
  cartalax: ['cartalax'],
  matrixyl: ['matrixyl', 'pal-kttks'],
  argireline: ['argireline'],
  'snap-8': ['snap8', 'snap 8'],
  'ptd-dbm': ['ptddbm', 'ptd dbm'],

  // Bioregulators (common short names)
  pinealon: ['pinealon', 'edr'],
  bronchogen: ['bronchogen'],
  cardiogen: ['cardiogen'],
  chonluten: ['chonluten'],
  cortagen: ['cortagen'],
  livagen: ['livagen'],
  ovagen: ['ovagen'],
  pancragen: ['pancragen'],
  prostamax: ['prostamax'],
  testagen: ['testagen'],
  thymogen: ['thymogen'],
  vesilute: ['vesilute'],
  vesugen: ['vesugen'],
  vilon: ['vilon'],
};

/** Tokens too ambiguous to match alone (false positives). */
const BLOCKED_TOKENS = new Set([
  'ot',
  'hex',
  'nasa',
  'ra',
  'glp',
  'gip',
  'ke',
  'ew',
  'ee',
  'frag',
  'copper',
  'love',
  'hormone',
  'peptide',
  'analog',
  'agonist',
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compactAlnum(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** Skip long descriptive alias phrases that cause false matches. */
function isUsableAlias(alias: string): boolean {
  const t = alias.trim();
  if (t.length < 2 || t.length > 36) return false;
  if (
    /\b(analog|agonist|peptide|fragment|receptor|pathway|research|mimetic|compound|hormone|bioregulator|inhibitor|co-agonist|dual agonist|triple agonist)\b/i.test(
      t,
    ) &&
    /\s/.test(t)
  ) {
    return false;
  }
  return true;
}

function expandTokenVariants(token: string): string[] {
  const raw = token.trim();
  if (!raw) return [];
  const lower = raw.toLowerCase();
  const variants = new Set<string>([lower]);

  // Hyphen / space variants: bpc-157 ↔ bpc 157 ↔ bpc157
  variants.add(lower.replace(/-/g, ' '));
  variants.add(lower.replace(/-/g, ''));
  variants.add(lower.replace(/\s+/g, ''));
  variants.add(lower.replace(/\s+/g, '-'));

  const compact = compactAlnum(lower);
  if (compact.length >= 3) variants.add(compact);

  return [...variants].filter((v) => {
    const c = compactAlnum(v);
    if (c.length < 2) return false;
    if (BLOCKED_TOKENS.has(c)) return false;
    if (BLOCKED_TOKENS.has(v.trim())) return false;
    return true;
  });
}

function mentionTokensFor(compound: KnowledgeCompound): string[] {
  const slang = COMPOUND_SLANG[compound.id] ?? [];
  const seeds = [
    compound.id,
    compound.name,
    ...compound.aliases.filter(isUsableAlias),
    ...slang,
  ];

  const tokens = new Set<string>();
  for (const seed of seeds) {
    for (const variant of expandTokenVariants(seed)) {
      tokens.add(variant);
    }
  }
  return [...tokens];
}

function textMentionsToken(text: string, compactText: string, token: string): boolean {
  const trimmed = token.trim().toLowerCase();
  if (trimmed.length < 2) return false;
  if (BLOCKED_TOKENS.has(compactAlnum(trimmed))) return false;

  // Spaced / hyphenated forms — word-boundary match on original text.
  if (/[^a-z0-9]/i.test(trimmed) || trimmed.length >= 3) {
    const escaped = escapeRegExp(trimmed).replace(/\s+/g, '[\\s-]+');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) return true;
  }

  // Compact codes in de-hyphenated text: "bpc157", "ss31", "cjc1295"
  const compactToken = compactAlnum(trimmed);
  if (compactToken.length >= 3 && compactToken.length <= 24) {
    if (new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(compactToken)}(?:$|[^a-z0-9])`, 'i').test(compactText)) {
      return true;
    }
  }

  return false;
}

function tokenRank(token: string): number {
  // Prefer longer / more specific mentions when ranking hits.
  return compactAlnum(token).length * 2 + (token.includes('-') || token.includes(' ') ? 1 : 0);
}

/**
 * Find peptide compounds mentioned in free text (ids, names, aliases, slang).
 * Works across all research categories — not just metabolic.
 */
export function findMentionedCompoundIds(text: string): string[] {
  if (!text.trim()) return [];

  const compactText = compactAlnum(text);
  const hits: { id: string; rank: number }[] = [];

  for (const compound of KNOWLEDGE_COMPOUNDS) {
    if (!compound.isPeptide) continue;
    const tokens = mentionTokensFor(compound);
    let matched = false;
    let bestRank = 0;
    for (const token of tokens) {
      if (textMentionsToken(text, compactText, token)) {
        matched = true;
        bestRank = Math.max(bestRank, tokenRank(token));
      }
    }
    if (matched) {
      hits.push({ id: compound.id, rank: bestRank });
    }
  }

  // Longer / more specific mentions first (e.g. cjc-1295-dac before cjc).
  hits.sort((a, b) => b.rank - a.rank);
  return [...new Set(hits.map((hit) => hit.id))];
}
