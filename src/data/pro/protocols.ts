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
        name: 'Retatrutide',
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
        name: 'Tirzepatide',
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
];

export function getProtocol(id: string): ProProtocol | undefined {
  return PRO_PROTOCOLS.find((protocol) => protocol.id === id);
}
