export type ProtocolPeptide = {
  peptideId: string;
  name: string;
  role: string;
  /** Educational research-range note — not a personal dose. */
  researchNote: string;
};

export type ProProtocol = {
  id: string;
  name: string;
  goal: string;
  summary: string;
  focus: string[];
  difficulty: 'Beginner-friendly' | 'Intermediate' | 'Advanced research';
  peptides: ProtocolPeptide[];
  notes: string[];
};

export const PRO_PROTOCOLS: ProProtocol[] = [
  {
    id: 'metabolic-focus',
    name: 'Metabolic focus stack',
    goal: 'Appetite + metabolic research',
    summary:
      'A research-oriented shortlist centered on dual/triple agonist and amylin pathways discussed for weight and metabolic endpoints.',
    focus: ['Appetite', 'Metabolic', 'Weekly cadence'],
    difficulty: 'Intermediate',
    peptides: [
      {
        peptideId: 'retatrutide',
        name: 'GL3RT',
        role: 'Primary metabolic research compound',
        researchNote: 'Start-low weekly research ranges in trials; titration only if studied.',
      },
      {
        peptideId: 'cagrilintide',
        name: 'Cagrilintide',
        role: 'Amylin pathway complement',
        researchNote: 'Often discussed when appetite remains high on a GLP-family compound.',
      },
      {
        peptideId: 'tirzepatide',
        name: 'GL2TZ',
        role: 'Dual-agonist alternative anchor',
        researchNote: 'Label/trial step-up schedules are educational reference only.',
      },
    ],
    notes: [
      'Compare one primary metabolic compound at a time in your research log.',
      'Educational stack — not a prescription or personal protocol.',
    ],
  },
  {
    id: 'recovery-repair',
    name: 'Recovery & tissue research stack',
    goal: 'Repair / recovery research',
    summary:
      'Common educational pairing for injury-adjacent research conversations — evidence is limited and mostly non-definitive in humans.',
    focus: ['Recovery', 'Soft tissue', 'Local research interest'],
    difficulty: 'Beginner-friendly',
    peptides: [
      {
        peptideId: 'bpc-157',
        name: 'BPC-157',
        role: 'Primary repair research mention',
        researchNote: 'Research talks often in the low-hundreds of mcg; human data limited.',
      },
      {
        peptideId: 'tb-500',
        name: 'TB-500',
        role: 'Systemic recovery research mention',
        researchNote: 'Loading then maintenance patterns appear in community research talks.',
      },
      {
        peptideId: 'ghk-cu',
        name: 'GHK-Cu',
        role: 'Skin / remodeling research add-on',
        researchNote: 'Topical vs injectable contexts differ — formulation matters.',
      },
    ],
    notes: [
      'Treat as a research shortlist for Library + Chat follow-up, not a treatment plan.',
      'Injury care belongs with a qualified clinician.',
    ],
  },
  {
    id: 'sleep-recovery-gh',
    name: 'Sleep & GH-axis research stack',
    goal: 'Sleep / recovery signaling',
    summary:
      'GHRH/GHRP-style research pairing often discussed for nighttime recovery signaling — not a sleep medicine substitute.',
    focus: ['Sleep', 'Recovery', 'Pulsatile research talks'],
    difficulty: 'Intermediate',
    peptides: [
      {
        peptideId: 'cjc-1295',
        name: 'CJC-1295 (No-DAC talks)',
        role: 'GHRH research backbone',
        researchNote: 'No-DAC research talks often ~100 mcg with a GHRP pulse.',
      },
      {
        peptideId: 'ipamorelin',
        name: 'Ipamorelin',
        role: 'GHRP pulse partner',
        researchNote: 'Common research talks ~100–300 mcg per pulse.',
      },
      {
        peptideId: 'tesamorelin',
        name: 'Tesamorelin',
        role: 'Clinical GH-axis reference',
        researchNote: 'Indication-specific clinical research context — not a casual add-on.',
      },
    ],
    notes: [
      'Appetite increase and glucose effects can matter — research carefully.',
      'Educational only; confirm any personal use with a clinician.',
    ],
  },
  {
    id: 'skin-repair-cosmetic',
    name: 'Skin & cosmetic research stack',
    goal: 'Skin / cosmetic research',
    summary:
      'Topical and copper-peptide oriented research shortlist for appearance and remodeling conversations.',
    focus: ['Skin', 'Cosmetic', 'Topical-first'],
    difficulty: 'Beginner-friendly',
    peptides: [
      {
        peptideId: 'ghk-cu',
        name: 'GHK-Cu',
        role: 'Primary copper peptide',
        researchNote: 'Often discussed topically; injectable research use varies by formulation.',
      },
      {
        peptideId: 'kpv',
        name: 'KPV',
        role: 'Inflammation / barrier research mention',
        researchNote: 'Research talks often low hundreds of mcg; human data limited.',
      },
      {
        peptideId: 'snap-8',
        name: 'SNAP-8',
        role: 'Cosmetic expression-line research',
        researchNote: 'Topical cosmetic use per product formulation.',
      },
    ],
    notes: [
      'Prefer product-labeled topical directions when applicable.',
      'Not a substitute for dermatology care.',
    ],
  },
  {
    id: 'immune-support-research',
    name: 'Immune research stack',
    goal: 'Immune / resilience research',
    summary:
      'Educational grouping of immune-adjacent peptides that appear in research and clinical literature — high caution, clinician territory.',
    focus: ['Immune', 'Resilience', 'Clinic-directed context'],
    difficulty: 'Advanced research',
    peptides: [
      {
        peptideId: 'thymosin-alpha-1',
        name: 'Thymosin Alpha-1',
        role: 'Immune modulation research',
        researchNote: 'Clinical schedules vary; not consumer self-protocol material.',
      },
      {
        peptideId: 'll-37',
        name: 'LL-37',
        role: 'Host-defense peptide research',
        researchNote: 'Specialized research dosing; human protocols not standardized.',
      },
      {
        peptideId: 'ara-290',
        name: 'ARA-290',
        role: 'Neuropathy / innate repair research',
        researchNote: 'Clinical research doses studied for neuropathy contexts.',
      },
    ],
    notes: [
      'Immune compounds are easy to misuse — keep this educational.',
      'Any real-world use belongs under clinical supervision.',
    ],
  },
  {
    id: 'cagrisema-appetite',
    name: 'CagriSema appetite research pair',
    goal: 'Appetite + weight research',
    summary:
      'Educational pairing of an amylin analogue with a GLP-1 agonist — often discussed together when researching appetite and metabolic endpoints.',
    focus: ['Appetite', 'Metabolic', 'GLP-1 + amylin'],
    difficulty: 'Intermediate',
    peptides: [
      {
        peptideId: 'cagrilintide',
        name: 'Cagrilintide',
        role: 'Amylin-pathway appetite research',
        researchNote:
          'Discussed for satiety and food-intake signaling alongside incretin research.',
      },
      {
        peptideId: 'semaglutide',
        name: 'GL1SM',
        role: 'GLP-1 agonist research anchor',
        researchNote:
          'Weekly GLP-1 research compound widely referenced in metabolic and appetite literature.',
      },
    ],
    notes: [
      'Log each compound separately in your research notes when comparing pathways.',
      'Educational stack — not a prescription or personal protocol.',
    ],
  },
  {
    id: 'reta-cagri-appetite',
    name: 'GL3RT + Cagrilintide research pair',
    goal: 'Appetite + metabolic research',
    summary:
      'Research shortlist pairing a multi-agonist metabolic compound with an amylin-pathway complement for appetite-focused study.',
    focus: ['Appetite', 'Metabolic', 'Multi-agonist'],
    difficulty: 'Advanced research',
    peptides: [
      {
        peptideId: 'retatrutide',
        name: 'GL3RT',
        role: 'Triple-agonist metabolic research compound',
        researchNote:
          'Investigational multi-receptor agonist discussed for metabolic and weight-related endpoints.',
      },
      {
        peptideId: 'cagrilintide',
        name: 'Cagrilintide',
        role: 'Amylin pathway complement',
        researchNote:
          'Often discussed when appetite signaling is a separate research focus from incretin pathways.',
      },
    ],
    notes: [
      'Treat as an experimental research pairing concept, not an established routine stack.',
      'Educational only — confirm any personal questions with a clinician.',
    ],
  },
  {
    id: 'sermorelin-ipamorelin-gh',
    name: 'Sermorelin + Ipamorelin GH research pair',
    goal: 'GH / IGF-1 axis research',
    summary:
      'Classic GHRH + GHRP educational pairing for pulsatile growth-hormone signaling research.',
    focus: ['GH axis', 'Recovery', 'Pulsatile research talks'],
    difficulty: 'Intermediate',
    peptides: [
      {
        peptideId: 'sermorelin',
        name: 'Sermorelin',
        role: 'GHRH analogue research backbone',
        researchNote:
          'GHRH-pathway compound discussed for stimulating endogenous GH pulse research.',
      },
      {
        peptideId: 'ipamorelin',
        name: 'Ipamorelin',
        role: 'GHRP / GHS pulse partner',
        researchNote:
          'Selective ghrelin-mimetic often paired in research talks with a GHRH analogue.',
      },
    ],
    notes: [
      'Distinct from CJC-1295 pairings — compare Library entries when studying GHRH analogues.',
      'Educational only; GH-axis research can involve glucose and IGF-1 considerations.',
    ],
  },
  {
    id: 'mots-ss31-mito',
    name: 'MOTS-c + SS-31 mitochondrial research pair',
    goal: 'Mitochondrial / metabolic research',
    summary:
      'Educational pairing of mitochondrial-peptide research compounds discussed for cellular energy and metabolic signaling.',
    focus: ['Mitochondria', 'Metabolic', 'Cellular energy'],
    difficulty: 'Advanced research',
    peptides: [
      {
        peptideId: 'mots-c',
        name: 'MOTS-c',
        role: 'Mitochondrial-derived peptide research',
        researchNote:
          'Discussed in metabolic homeostasis and exercise-adaptation research contexts.',
      },
      {
        peptideId: 'ss-31',
        name: 'SS-31 (Elamipretide)',
        role: 'Mitochondrial membrane research compound',
        researchNote:
          'Cardiolipin-targeting peptide studied for mitochondrial function in clinical research settings.',
      },
    ],
    notes: [
      'Human combination research is limited — use Library + Chat to review each compound alone first.',
      'Educational stack only; not a personal energy or performance protocol.',
    ],
  },
  {
    id: 'aod-glp1-fat-loss',
    name: 'AOD-9604 + GL1SM research pair',
    goal: 'Fat-loss pathway research',
    summary:
      'Educational shortlist pairing a GH-fragment fat-metabolism research mention with a GLP-1 agonist for comparative metabolic study.',
    focus: ['Fat loss', 'Metabolic', 'Comparative research'],
    difficulty: 'Intermediate',
    peptides: [
      {
        peptideId: 'aod-9604',
        name: 'AOD-9604',
        role: 'GH-fragment fat-metabolism research mention',
        researchNote:
          'Derived from hGH fragment research; often discussed in fat-loss conversations with limited human outcome clarity.',
      },
      {
        peptideId: 'semaglutide',
        name: 'GL1SM',
        role: 'GLP-1 agonist research anchor',
        researchNote:
          'Incretin pathway compound with extensive metabolic and appetite research literature.',
      },
    ],
    notes: [
      'Compare each pathway on its own evidence — this is a research shortlist, not a proven additive stack.',
      'Educational only — not medical advice.',
    ],
  },
  {
    id: 'bpc-ghk-tissue',
    name: 'BPC-157 + GHK-Cu tissue research pair',
    goal: 'Tissue / skin recovery research',
    summary:
      'Educational pairing for soft-tissue and remodeling research conversations — repair peptide with copper-peptide support.',
    focus: ['Recovery', 'Tissue', 'Skin remodeling'],
    difficulty: 'Beginner-friendly',
    peptides: [
      {
        peptideId: 'bpc-157',
        name: 'BPC-157',
        role: 'Primary repair research mention',
        researchNote:
          'Gastric-derived peptide often discussed in soft-tissue and recovery research talks.',
      },
      {
        peptideId: 'ghk-cu',
        name: 'GHK-Cu',
        role: 'Copper peptide remodeling add-on',
        researchNote:
          'Discussed for skin and extracellular-matrix remodeling; topical vs injectable contexts differ.',
      },
    ],
    notes: [
      'Narrower than the full recovery triple stack — useful when focusing on tissue + skin pathways.',
      'Educational only; injury care belongs with a qualified clinician.',
    ],
  },
  {
    id: 'ghk-tb500-repair',
    name: 'GHK-Cu + TB-500 repair research pair',
    goal: 'Skin / tissue repair research',
    summary:
      'Educational pairing of copper-peptide remodeling talk with a systemic recovery research mention.',
    focus: ['Skin', 'Tissue repair', 'Recovery'],
    difficulty: 'Beginner-friendly',
    peptides: [
      {
        peptideId: 'ghk-cu',
        name: 'GHK-Cu',
        role: 'Primary copper peptide',
        researchNote:
          'Often discussed for appearance and remodeling research; formulation route matters.',
      },
      {
        peptideId: 'tb-500',
        name: 'TB-500',
        role: 'Systemic recovery research mention',
        researchNote:
          'Thymosin-beta-4 fragment talks often focus on mobility and systemic recovery research contexts.',
      },
    ],
    notes: [
      'Use alongside Library entries when comparing remodeling vs systemic recovery pathways.',
      'Educational stack — not a treatment plan.',
    ],
  },
];

export function getProtocol(id: string): ProProtocol | undefined {
  return PRO_PROTOCOLS.find((protocol) => protocol.id === id);
}
