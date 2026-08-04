import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ts = (rel) => pathToFileURL(join(root, rel)).href;

const { KNOWLEDGE_COMPOUNDS } = await import(ts('src/data/knowledge/compounds.ts'));
const { METABOLIC_TIER_GUIDE } = await import(
  ts('src/data/knowledge/metabolic-guide.ts')
);
const { MUSCLE_RESEARCH_GUIDE } = await import(
  ts('src/data/knowledge/muscle-guide.ts')
);

const metabolic = new Map(METABOLIC_TIER_GUIDE.map((e) => [e.id, e]));
const muscle = new Map(MUSCLE_RESEARCH_GUIDE.map((e) => [e.id, e]));

const CATEGORY_EFFECTS = {
  metabolic_weight: ['Weight / fat loss', 'Appetite / satiety', 'Metabolic support'],
  healing_recovery: ['Tissue repair', 'Recovery support', 'Inflammation modulation'],
  cosmetic_skin: ['Skin quality', 'Collagen / cosmetic support'],
  sexual_health: ['Sexual response / libido', 'Reproductive signaling'],
  hair_research: ['Hair / follicle support', 'Scalp signaling'],
  gh_secretagogues: ['GH release', 'Lean mass / recovery support'],
  sleep_circadian: ['Sleep quality', 'Circadian / recovery'],
  cognitive_neuropeptide: ['Focus / cognition', 'Stress modulation'],
  general: ['General research use'],
};

const DOSING_DEFAULTS = {
  retatrutide: 'Start ~1–2 mg/wk → increase only if needed, up to ~12 mg/wk.',
  tirzepatide: 'Start 2.5 mg/wk ×4 → step up every 4 wks only if needed (to 15 mg).',
  semaglutide: 'Start 0.25 mg/wk ×4 → step up only if needed (to 2.4 mg).',
  cagrilintide: 'Start low weekly → raise only if needed (trials often → ~2.4 mg).',
  mazdutide: 'Start low weekly → increase only if needed (studied ~6–9 mg).',
  survodutide: 'Start ~0.6 mg/wk → increase only if needed (studied to ~4.8 mg).',
  orforglipron: 'Start low daily oral → increase only if needed (trial range varies).',
  amycretin: 'Start lowest weekly step → increase only if needed.',
  tesofensine: 'Start 0.25 mg/day → increase only if needed (to ~0.5–1 mg).',
  tesamorelin: 'Typically fixed 2 mg/day in labeled visceral-fat contexts.',
  'mots-c': 'Research talks vary; common discussion ~5–15 mg intermittent.',
  '5-amino-1mq': 'Research talks often ~50–150 mg/day oral; human data limited.',
  'aod-9604': 'Research talks often ~250–500 mcg/day; evidence for fat loss is weak.',
  bam15: 'No established human dose ladder (preclinical).',
  nmn: 'Common research talks ~250–1000 mg/day oral.',
  sr9009: 'No validated human dose ladder; preclinical only.',
  sr9011: 'No validated human dose ladder; preclinical only.',
  gw501516: 'No safe consumer dose ladder — toxicity concerns.',
  gw0742: 'No validated human dose ladder.',
  clenbuterol: 'Not recommended for fat loss; high CV risk.',
  albuterol: 'Labeled inhaler use only; not a fat-loss protocol.',
  'methylene-blue': 'Low-dose research talks vary widely; not a direct fat-loss drug.',
  'gc-1': 'Investigational; no consumer dose ladder.',
  'bpc-157': 'Research talks often ~250–500 mcg/day; human evidence limited.',
  'tb-500': 'Research talks often loading then lower maintenance; human data limited.',
  'ghk-cu': 'Topical or injectable research use varies by formulation.',
  kpv: 'Research talks often low hundreds of mcg; human data limited.',
  'll-37': 'Specialized research dosing; human protocols not standardized.',
  'ara-290': 'Clinical research doses studied for neuropathy; not consumer guidance.',
  'thymosin-alpha-1': 'Clinical schedules vary (e.g. mg-range SQ in studied settings).',
  'cjc-1295': 'No-DAC research talks: ~100 mcg with GHRP pulses.',
  'cjc-1295-dac': 'Long-acting research talks often ~1–2 mg/week.',
  ipamorelin: 'Common research talks: ~100–300 mcg per pulse, 1–3×/day.',
  'peg-mgf': 'No validated human dose ladder.',
  'igf-1-lr3': 'No established safe consumer ladder — research-only caution.',
  cartalax: 'Bioregulator research dosing not standardized for consumers.',
  'melanotan-i': 'Approved afamelanotide is implant/clinic-directed; research peptides differ.',
  'melanotan-ii': 'Research nasal/injectable talks vary; side-effect risk is meaningful.',
  'pt-141': 'Labeled bremelanotide is clinic-directed; research nasal talks differ.',
  epitalon: 'Research talks often short cycles; human evidence limited.',
  matrixyl: 'Topical cosmetic use per product formulation.',
  argireline: 'Topical cosmetic use per product formulation.',
  'snap-8': 'Topical cosmetic use per product formulation.',
  'kisspeptin-10': 'Research/diagnostic dosing only; not a self-protocol.',
  'kisspeptin-54': 'Research/diagnostic dosing only; not a self-protocol.',
  oxytocin: 'Intranasal research doses vary; labeled obstetric use is separate.',
  hcg: 'Indication-specific clinical dosing only.',
  gonadorelin: 'Indication-specific clinical dosing only.',
  tadalafil: 'Labeled ED dosing often 2.5–5 mg daily or 10–20 mg as needed.',
  aminotadalafil: 'No established equivalent to tadalafil labeling.',
  hmg: 'Fertility clinic dosing only.',
  'ptd-dbm': 'Topical research use; human protocols not standardized.',
  ru58841: 'Topical research talks often solution % based; systemic risk uncertain.',
  'kx-826': 'Clinical topical regimens under study; follow trial/product context.',
  'cb-03-01': 'Topical clinical use (clascoterone) per labeled acne contexts.',
  topilutamide: 'Topical research use; protocols not standardized.',
  sermorelin: 'Research talks often ~200–300 mcg at night.',
  'mod-grf-1-29': 'Research talks often ~100 mcg with a GHRP pulse.',
  'ghrp-2': 'Research talks often ~100–300 mcg per pulse.',
  'ghrp-6': 'Research talks often ~100–300 mcg per pulse (appetite increase common).',
  hexarelin: 'Research talks often ~100–200 mcg per pulse; stronger AE potential.',
  'mk-677': 'Trial-style talks: start ~12.5 mg/day → only if needed to 25 mg.',
  anamorelin: 'Studied oral doses in cachexia trials; region-specific labeling.',
  macimorelin: 'Diagnostic dosing only (GH stimulation testing).',
  ghrelin: 'Endogenous/research peptide; not a consumer protocol.',
  dsip: 'Research talks vary (often mcg-range); human evidence limited.',
  selank: 'Nasal research talks often hundreds of mcg; evidence limited.',
  semax: 'Nasal research talks often hundreds of mcg; evidence limited.',
  noopept: 'Oral/nasal research talks often low-mg range; evidence modest.',
  glutathione: 'IV/nasal/oral forms differ widely; dosing is route-specific.',
  'nad-plus': 'IV/nasal/oral research use varies; protocols not standardized.',
  'ss-31': 'Investigational mitochondrial peptide; clinical doses under study.',
};

const MAIN_EFFECT_OVERRIDES = {
  retatrutide: ['Weight loss', 'Appetite suppression', 'Metabolic / liver-fat support'],
  cagrilintide: ['Appetite suppression', 'Satiety', 'Weight loss (esp. with GLP-1)'],
  semaglutide: ['Weight loss', 'Blood sugar control', 'Appetite suppression'],
  tirzepatide: ['Weight loss', 'Glycemic control', 'Appetite suppression'],
  mazdutide: ['Weight loss', 'Metabolic dual-agonist effects'],
  survodutide: ['Weight loss', 'Liver-fat / metabolic support'],
  orforglipron: ['Weight loss', 'Oral GLP-1 appetite control'],
  amycretin: ['Weight loss', 'Appetite / satiety (GLP-1 + amylin)'],
  'aod-9604': ['Fat-loss claims (weak evidence)'],
  tesofensine: ['Appetite suppression', 'Weight loss', 'Craving reduction'],
  '5-amino-1mq': ['Metabolic support', 'Fat-loss research (early)'],
  'mots-c': ['Metabolic efficiency', 'Exercise / energy research'],
  tesamorelin: ['Visceral fat reduction', 'GH release', 'Body composition'],
  bam15: ['Energy expenditure', 'Fat oxidation (preclinical)'],
  nmn: ['Cellular energy / NAD+', 'Modest body-composition research'],
  sr9009: ['Energy expenditure claims', 'Circadian modulation (preclinical)'],
  sr9011: ['Energy expenditure claims', 'Circadian modulation (preclinical)'],
  gw501516: ['Fat oxidation / endurance claims', 'High toxicity concern'],
  gw0742: ['Fat oxidation / endurance research'],
  clenbuterol: ['Metabolic rate increase', 'High cardiovascular risk'],
  albuterol: ['Mild metabolic / bronchodilator effects'],
  'methylene-blue': ['Mitochondrial / energy support (indirect)'],
  'gc-1': ['Metabolism support', 'Lipid effects (investigational)'],
  'bpc-157': ['Tissue repair', 'Gut / tendon recovery (preclinical-heavy)'],
  'tb-500': ['Soft-tissue recovery', 'Repair signaling'],
  'ghk-cu': ['Skin repair', 'Collagen support', 'Hair / scalp support'],
  kpv: ['Anti-inflammatory', 'Gut / tissue calming', 'Scalp inflammation'],
  'll-37': ['Antimicrobial', 'Wound healing / immune signaling'],
  'ara-290': ['Nerve / inflammation protection'],
  'thymosin-alpha-1': ['Immune regulation', 'Recovery support'],
  'cjc-1295': ['GH release', 'Recovery / body composition'],
  'cjc-1295-dac': ['Sustained GH signaling', 'IGF-1 elevation'],
  ipamorelin: ['GH release', 'Recovery / sleep support', 'Lean-tissue support'],
  'peg-mgf': ['Local muscle repair (theoretical)'],
  'igf-1-lr3': ['Muscle anabolism', 'Tissue growth (higher risk)'],
  cartalax: ['Cartilage / joint support claims'],
  'melanotan-i': ['Melanin increase', 'UV-protection research'],
  'melanotan-ii': ['Tanning', 'Libido side effects possible'],
  'pt-141': ['Sexual arousal / libido'],
  epitalon: ['Longevity signaling', 'Sleep rhythm research'],
  matrixyl: ['Wrinkle appearance', 'Collagen support'],
  argireline: ['Expression-line softening'],
  'snap-8': ['Expression-line softening'],
  'kisspeptin-10': ['Reproductive hormone cascade', 'Fertility signaling'],
  'kisspeptin-54': ['Reproductive hormone cascade', 'Longer-acting fertility signaling'],
  oxytocin: ['Bonding / social signaling', 'Sexual response support'],
  hcg: ['Testosterone / fertility signaling'],
  gonadorelin: ['LH / FSH release', 'Fertility stimulation'],
  tadalafil: ['Erectile blood flow', 'PDE5 vasodilation'],
  aminotadalafil: ['Vasodilation / sexual-health analog (weaker data)'],
  hmg: ['Fertility stimulation (FSH/LH activity)'],
  'ptd-dbm': ['Hair follicle reactivation (Wnt pathway)'],
  ru58841: ['Scalp DHT blockade', 'Hair preservation'],
  'kx-826': ['Scalp DHT blockade', 'Shedding reduction research'],
  'cb-03-01': ['Local anti-androgen', 'Follicle / acne contexts'],
  topilutamide: ['Topical androgen blockade', 'Hair preservation'],
  sermorelin: ['GH release', 'Body composition / recovery'],
  'mod-grf-1-29': ['Pulsatile GH release'],
  'ghrp-2': ['Strong GH release', 'Appetite increase possible'],
  'ghrp-6': ['GH release', 'Hunger increase'],
  hexarelin: ['Strong GH pulse', 'Higher side-effect potential'],
  'mk-677': ['GH / IGF-1 elevation', 'Lean mass', 'Appetite increase'],
  anamorelin: ['Appetite', 'Lean mass in cachexia research'],
  macimorelin: ['GH deficiency diagnostic testing'],
  ghrelin: ['Hunger signaling', 'GH release'],
  dsip: ['Deep sleep support', 'Stress / relaxation research'],
  selank: ['Calm focus', 'Anxiety reduction research'],
  semax: ['Focus / alertness', 'Cognitive lift'],
  noopept: ['Cognitive support', 'Mild nootropic effects'],
  glutathione: ['Antioxidant support'],
  'nad-plus': ['Cellular energy / NAD+ support'],
  'ss-31': ['Mitochondrial protection research'],
};

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function mainEffectsFor(c) {
  if (MAIN_EFFECT_OVERRIDES[c.id]) return MAIN_EFFECT_OVERRIDES[c.id];
  const fromAreas = (c.researchAreas || [])
    .slice(0, 3)
    .map((a) => a.replace(/ research$/i, '').trim());
  const fromCats = (c.categories || []).flatMap((cat) => CATEGORY_EFFECTS[cat] || []);
  const mixed = uniq([...fromAreas, ...fromCats]).slice(0, 4);
  return mixed.length ? mixed : ['Research compound'];
}

function whyFor(c) {
  return metabolic.get(c.id)?.why || muscle.get(c.id)?.why || c.summary;
}

function dosingFor(c) {
  return (
    metabolic.get(c.id)?.researchDosing ||
    muscle.get(c.id)?.researchDosing ||
    DOSING_DEFAULTS[c.id] ||
    'Research dosing not standardized — discuss studied ranges only; start low if titration is discussed.'
  );
}

function evidenceFor(c) {
  return (
    metabolic.get(c.id)?.evidenceNote ||
    muscle.get(c.id)?.evidenceNote ||
    c.humanEvidenceGrade.replace(/_/g, ' ')
  );
}

const entries = KNOWLEDGE_COMPOUNDS.filter(
  (c) => c.isPeptide && c.id !== 'nasal-delivery-general',
).map((c) => ({
  id: c.id,
  name: c.name,
  mainEffects: mainEffectsFor(c),
  why: whyFor(c),
  researchDosing: dosingFor(c),
  evidenceNote: evidenceFor(c),
  categories: c.categories,
}));

const body = entries
  .map((entry) => {
    const effects = entry.mainEffects.map((e) => JSON.stringify(e)).join(', ');
    const cats = entry.categories.map((e) => JSON.stringify(e)).join(', ');
    return `  {
    id: ${JSON.stringify(entry.id)},
    name: ${JSON.stringify(entry.name)},
    mainEffects: [${effects}],
    why: ${JSON.stringify(entry.why)},
    researchDosing: ${JSON.stringify(entry.researchDosing)},
    evidenceNote: ${JSON.stringify(entry.evidenceNote)},
    categories: [${cats}],
  }`;
  })
  .join(',\n');

const file = `export type PeptideGuideEntry = {
  id: string;
  name: string;
  /** Short primary effects used in UI + model grounding. */
  mainEffects: string[];
  why: string;
  researchDosing: string;
  evidenceNote: string;
  categories: string[];
};

/**
 * Complete research guide for every PepGuide compound.
 * mainEffects are the quick-reference tags for chat, cards, and retrieval.
 */
export const PEPTIDE_GUIDE: PeptideGuideEntry[] = [
${body}
];

const byId = new Map(PEPTIDE_GUIDE.map((entry) => [entry.id, entry]));

export function getPeptideGuideById(id: string): PeptideGuideEntry | undefined {
  return byId.get(id);
}

export function getPeptideGuideByIds(ids: string[]): PeptideGuideEntry[] {
  const order = new Map(ids.map((id, index) => [id, index]));
  return ids
    .map((id) => byId.get(id))
    .filter((entry): entry is PeptideGuideEntry => Boolean(entry))
    .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
}

export function getAllPeptideGuideEntries(): PeptideGuideEntry[] {
  return PEPTIDE_GUIDE;
}

export function formatMainEffects(entry: PeptideGuideEntry): string {
  return entry.mainEffects.join(' · ');
}
`;

writeFileSync(join(root, 'src/data/knowledge/peptide-guide.ts'), file);
console.log('Wrote', entries.length, 'peptide guide entries');
