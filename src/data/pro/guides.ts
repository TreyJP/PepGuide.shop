export type ProGuideLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  /** Optional hosted video URL — leave empty until content is uploaded. */
  videoUrl?: string;
  summary: string;
};

export type ProGuideCourse = {
  id: string;
  title: string;
  tagline: string;
  level: 'Start here' | 'Core' | 'Advanced';
  lessonCount: number;
  totalMinutes: number;
  lessons: ProGuideLesson[];
};

export const PRO_GUIDE_COURSES: ProGuideCourse[] = [
  {
    id: 'foundations',
    title: 'Peptide research foundations',
    tagline: 'How to learn peptides the right way — evidence, safety framing, and tools.',
    level: 'Start here',
    lessonCount: 4,
    totalMinutes: 42,
    lessons: [
      {
        id: 'foundations-1',
        title: 'What PepGuide Pro is (and isn’t)',
        durationMinutes: 8,
        summary:
          'Educational research framing, what Pro unlocks, and how to use Guides vs Protocols.',
      },
      {
        id: 'foundations-2',
        title: 'Reading evidence without the hype',
        durationMinutes: 12,
        summary:
          'Human vs animal vs in-vitro signals, common marketing traps, and what “research dosing” means.',
      },
      {
        id: 'foundations-3',
        title: 'Using Chat, Library, and Cycle together',
        durationMinutes: 10,
        summary:
          'A practical walkthrough of the free tools plus how Pro content plugs into your research log.',
      },
      {
        id: 'foundations-4',
        title: 'Lab testing & vendor literacy',
        durationMinutes: 12,
        summary:
          'What COAs and lab panels usually cover, and how to compare partners without guessing.',
      },
    ],
  },
  {
    id: 'metabolic-stacks',
    title: 'Metabolic peptide literacy',
    tagline: 'Understand GLP / dual / triple agonist research stacks before you compare options.',
    level: 'Core',
    lessonCount: 3,
    totalMinutes: 36,
    lessons: [
      {
        id: 'metabolic-1',
        title: 'How metabolic peptides are usually discussed',
        durationMinutes: 14,
        summary:
          'Mechanisms at a high level, titration language in trials/labels, and appetite vs metabolic endpoints.',
      },
      {
        id: 'metabolic-2',
        title: 'Building a research comparison shortlist',
        durationMinutes: 12,
        summary:
          'How to use Protocols for goal-based stacks and Library cards for compound detail.',
      },
      {
        id: 'metabolic-3',
        title: 'Logging outcomes that actually matter',
        durationMinutes: 10,
        summary:
          'What to track in Cycle for research notes — consistency, tolerability themes, and questions for a clinician.',
      },
    ],
  },
  {
    id: 'recovery-repair',
    title: 'Recovery & repair research',
    tagline: 'Navigate healing-oriented peptides with clearer expectations and stack context.',
    level: 'Core',
    lessonCount: 3,
    totalMinutes: 28,
    lessons: [
      {
        id: 'recovery-1',
        title: 'Repair peptides 101',
        durationMinutes: 10,
        summary:
          'Where BPC-157, TB-500, and related compounds show up in research conversation — and limits of the evidence.',
      },
      {
        id: 'recovery-2',
        title: 'Pairing compounds in a stack (education only)',
        durationMinutes: 10,
        summary:
          'How Protocols group compounds by goal, and how to read “why this stack” notes critically.',
      },
      {
        id: 'recovery-3',
        title: 'When to pause and ask a professional',
        durationMinutes: 8,
        summary:
          'Red flags, injury context, and keeping PepGuide educational — not a treatment plan.',
      },
    ],
  },
  {
    id: 'advanced-logging',
    title: 'Advanced research logging',
    tagline: 'Turn scattered notes into a clean Pro workflow across stacks and guides.',
    level: 'Advanced',
    lessonCount: 2,
    totalMinutes: 18,
    lessons: [
      {
        id: 'advanced-1',
        title: 'From protocol → cycle log',
        durationMinutes: 9,
        summary:
          'How to take a Protocol stack and turn it into tracked Cycle entries without treating it as a prescription.',
      },
      {
        id: 'advanced-2',
        title: 'Reviewing a month of research notes',
        durationMinutes: 9,
        summary:
          'A simple weekly review ritual: what changed, what to re-check in Library, what to ask next in Chat.',
      },
    ],
  },
];

export function getGuideCourse(id: string): ProGuideCourse | undefined {
  return PRO_GUIDE_COURSES.find((course) => course.id === id);
}
