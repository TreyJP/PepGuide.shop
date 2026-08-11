import {
  PEPTIDE_OF_THE_WEEK,
  PEPTIDE_OF_WEEK_BANNER_ENABLED,
} from '@/src/data/pro/peptide-of-the-week';

export type ProGuideSection =
  | 'Peptide of the week'
  | 'Starter guides'
  | 'Research guides';

export type ProGuideLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  /** Display length for the thumbnail badge (e.g. `1:37`). Falls back to `N min`. */
  durationLabel?: string;
  /** Optional hosted video URL — YouTube, Vimeo, or `/guides/your-file.mp4`. */
  videoUrl?: string;
  summary: string;
};

export type ProGuideCourse = {
  id: string;
  title: string;
  tagline: string;
  level: ProGuideSection;
  lessonCount: number;
  totalMinutes: number;
  lessons: ProGuideLesson[];
};

export const GUIDE_SECTIONS: readonly ProGuideSection[] = [
  'Peptide of the week',
  'Starter guides',
  'Research guides',
] as const;

const STARTER_GUIDE_VIDEOS = {
  pin:
    process.env.NEXT_PUBLIC_STARTER_GUIDE_PIN_URL?.trim() ||
    '/guides/pinningguide.mp4',
  reconstitute:
    process.env.NEXT_PUBLIC_STARTER_GUIDE_RECONSTITUTE_URL?.trim() ||
    '/guides/guidereconstitute.mp4',
} as const;

function buildPeptideOfWeekCourse(): ProGuideCourse | null {
  const potw = PEPTIDE_OF_THE_WEEK;
  const hasVideo = Boolean(potw.videoUrl?.trim());
  if (!PEPTIDE_OF_WEEK_BANNER_ENABLED && !hasVideo) return null;

  return {
    id: 'peptide-of-the-week',
    title: 'Peptide of the week',
    tagline: potw.headline || 'This week’s featured educational walkthrough.',
    level: 'Peptide of the week',
    lessonCount: 1,
    totalMinutes: 12,
    lessons: [
      {
        id: 'potw-current',
        title: potw.name
          ? `${potw.name} — ${potw.weekLabel}`
          : 'This week’s featured peptide',
        durationMinutes: 12,
        videoUrl: hasVideo ? potw.videoUrl : undefined,
        summary:
          potw.blurb ||
          'A short educational look at this week’s featured peptide.',
      },
    ],
  };
}

const STARTER_GUIDES_COURSE: ProGuideCourse = {
  id: 'starter-guides',
  title: 'Starter guides',
  tagline: 'Begin here — short videos that get you oriented in PepGuide Pro.',
  level: 'Starter guides',
  lessonCount: 2,
  totalMinutes: 3,
  lessons: [
    {
      id: 'starter-reconstitute',
      title: 'How To Reconstitute Your Peptides',
      durationMinutes: 2,
      durationLabel: '1:37',
      videoUrl: STARTER_GUIDE_VIDEOS.reconstitute,
      summary: 'Step-by-step walkthrough for reconstituting research peptides.',
    },
    {
      id: 'starter-pin',
      title: 'How To Pin Peptides',
      durationMinutes: 1,
      durationLabel: '0:55',
      videoUrl: STARTER_GUIDE_VIDEOS.pin,
      summary:
        'How to prepare and administer a subcutaneous research injection.',
    },
  ],
};

/** Courses shown in Education & Research. */
export function getVisibleGuideCourses(): ProGuideCourse[] {
  const potw = buildPeptideOfWeekCourse();
  return potw ? [potw, STARTER_GUIDES_COURSE] : [STARTER_GUIDES_COURSE];
}

export const PRO_GUIDE_COURSES: ProGuideCourse[] = getVisibleGuideCourses();

export function getGuideCourse(id: string): ProGuideCourse | undefined {
  return getVisibleGuideCourses().find((course) => course.id === id);
}
