export type MuscleGuideEntry = {
  id: string;
  name: string;
  why: string;
  researchDosing: string;
  evidenceNote: string;
};

/**
 * Muscle / lean-mass research options used for chat dosing cards + affiliate clicks.
 * Dosing strings are research/discussion ranges, not personal medical advice.
 */
export const MUSCLE_RESEARCH_GUIDE: MuscleGuideEntry[] = [
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    why: 'Selective GH secretagogue; cleaner cortisol/prolactin profile.',
    researchDosing: 'Common research talks: ~100–300 mcg per pulse, 1–3×/day.',
    evidenceNote: 'Limited human',
  },
  {
    id: 'cjc-1295',
    name: 'CJC-1295',
    why: 'GHRH analog often discussed with ipamorelin for GH pulses.',
    researchDosing: 'No-DAC research talks: ~100 mcg with GHRP pulses.',
    evidenceNote: 'Limited human',
  },
  {
    id: 'sermorelin',
    name: 'Sermorelin',
    why: 'Classic GHRH fragment with prior clinical GH-stimulation use.',
    researchDosing: 'Research talks often ~200–300 mcg at night.',
    evidenceNote: 'Moderate human',
  },
  {
    id: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    why: 'Potent anabolic IGF analog; higher risk / weaker human safety data.',
    researchDosing: 'No established safe consumer ladder — research-only caution.',
    evidenceNote: 'Preclinical',
  },
  {
    id: 'peg-mgf',
    name: 'PEG-MGF',
    why: 'Local muscle-repair theory; human outcome evidence is weak.',
    researchDosing: 'No validated human dose ladder.',
    evidenceNote: 'Preclinical',
  },
];

export function getMuscleGuideByIds(ids: string[]): MuscleGuideEntry[] {
  const order = new Map(ids.map((id, index) => [id, index]));
  return MUSCLE_RESEARCH_GUIDE.filter((entry) => ids.includes(entry.id)).sort(
    (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
  );
}

export function getMuscleTopIds(limit = 3): string[] {
  return MUSCLE_RESEARCH_GUIDE.slice(0, limit).map((entry) => entry.id);
}
