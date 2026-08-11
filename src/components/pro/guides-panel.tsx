'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { BookmarkToggleButton } from '@/src/components/pro/bookmark-toggle-button';
import { GuideVideoModal } from '@/src/components/pro/guide-video-modal';
import { Badge } from '@/src/components/ui/badge';
import {
  GUIDE_SECTIONS,
  getVisibleGuideCourses,
  type ProGuideCourse,
  type ProGuideLesson,
  type ProGuideSection,
} from '@/src/data/pro/guides';
import { cn } from '@/src/lib/utils';

const SECTION_FILTERS = ['All sections', ...GUIDE_SECTIONS] as const;

type SectionFilter = (typeof SECTION_FILTERS)[number];

type ActiveLesson = {
  courseTitle: string;
  lesson: ProGuideLesson;
};

function lessonDurationLabel(lesson: ProGuideLesson) {
  return lesson.durationLabel ?? `${lesson.durationMinutes} min`;
}

function Thumb({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,color-mix(in_srgb,var(--accent)_28%,#0f172a),color-mix(in_srgb,var(--accent-secondary)_22%,#111827))] text-white',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,white,transparent_45%)]" />
      <Image
        src="/brand/logo-transparent.png"
        alt="PepGuide"
        width={1483}
        height={377}
        className="relative z-[1] h-auto w-[52%] max-w-[220px] object-contain drop-shadow-sm"
      />
      <span className="absolute bottom-2.5 right-3 z-[1] rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-wide text-white/95">
        {label}
      </span>
    </div>
  );
}

export function GuidesPanel() {
  const [section, setSection] = useState<SectionFilter>('All sections');
  const [active, setActive] = useState<ActiveLesson | null>(null);
  const allCourses = useMemo(() => getVisibleGuideCourses(), []);

  const sectionsToShow = useMemo(() => {
    if (section === 'All sections') return [...GUIDE_SECTIONS];
    return [section];
  }, [section]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <GuideVideoModal
        open={Boolean(active?.lesson.videoUrl)}
        title={active?.lesson.title ?? 'Guide'}
        description={
          active
            ? `${active.courseTitle} · ${lessonDurationLabel(active.lesson)}`
            : undefined
        }
        videoUrl={active?.lesson.videoUrl}
        onClose={() => setActive(null)}
      />
      <div
        className="-mx-0.5 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0"
        role="tablist"
        aria-label="Filter guides by section"
      >
        {SECTION_FILTERS.map((option) => {
          const selected = section === option;
          const count =
            option === 'All sections'
              ? allCourses.length
              : allCourses.filter((course) => course.level === option).length;

          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSection(option)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                selected
                  ? 'bg-accent text-white'
                  : 'bg-surface-secondary text-foreground-secondary hover:text-foreground',
              )}
            >
              {option}
              <span
                className={cn(
                  'text-[11px] tabular-nums',
                  selected ? 'text-white/80' : 'text-foreground-secondary',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {sectionsToShow.map((level) => {
          const courses = allCourses.filter((course) => course.level === level);
          return (
            <GuideSectionBlock
              key={level}
              level={level}
              courses={courses}
              onPlayLesson={(courseTitle, lesson) =>
                setActive({ courseTitle, lesson })
              }
            />
          );
        })}
      </div>

      <p className="text-xs text-foreground-secondary">
        Educational research content only. Not medical advice or instructions for
        personal medical use.
      </p>
    </div>
  );
}

function GuideSectionBlock({
  level,
  courses,
  onPlayLesson,
}: {
  level: ProGuideSection;
  courses: ProGuideCourse[];
  onPlayLesson: (courseTitle: string, lesson: ProGuideLesson) => void;
}) {
  if (courses.length === 0) {
    return (
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 px-0.5">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground sm:text-xl">
            {level}
          </h3>
          <Badge variant="accent">Coming soon</Badge>
        </div>
        <p className="text-sm text-foreground-secondary">
          New guides for this section are on the way.
        </p>
      </section>
    );
  }

  return (
    <>
      {courses.map((course) => (
        <GuideCourseSection
          key={course.id}
          course={course}
          onPlayLesson={onPlayLesson}
        />
      ))}
    </>
  );
}

function GuideCourseSection({
  course,
  onPlayLesson,
}: {
  course: ProGuideCourse;
  onPlayLesson: (courseTitle: string, lesson: ProGuideLesson) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2 px-0.5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground sm:text-xl">
              {course.title}
            </h3>
            <Badge variant="accent">{course.level}</Badge>
          </div>
          <p className="mt-1 text-sm text-foreground-secondary">
            {course.tagline}
          </p>
        </div>
        <p className="text-xs font-medium text-foreground-secondary">
          {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'} ·{' '}
          {course.totalMinutes} min
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {course.lessons.map((lesson) => (
          <div key={lesson.id} className="group text-left">
            <button
              type="button"
              onClick={() => {
                if (lesson.videoUrl) onPlayLesson(course.title, lesson);
              }}
              className="w-full text-left"
              title={lesson.videoUrl ? 'Play lesson' : 'Video uploading soon'}
            >
              <div className="relative overflow-hidden rounded-2xl">
                <Thumb label={lessonDurationLabel(lesson)} />
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/25 opacity-90 transition-opacity group-hover:bg-black/35 group-hover:opacity-100">
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg">
                    <Play className="size-5 fill-current" />
                  </span>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">
                {lesson.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-foreground-secondary">
                {lesson.summary}
              </p>
            </button>
            <div className="mt-1.5">
              <BookmarkToggleButton
                size="sm"
                className="-ml-2"
                input={{
                  kind: 'video',
                  courseId: course.id,
                  lessonId: lesson.id,
                  title: lesson.title,
                  videoUrl: lesson.videoUrl || null,
                  subtitle: `${course.title} · ${lessonDurationLabel(lesson)}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
