'use client';

import { Play, Video } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/src/components/ui/badge';
import {
  PRO_GUIDE_COURSES,
  type ProGuideCourse,
  type ProGuideLesson,
} from '@/src/data/pro/guides';
import { cn } from '@/src/lib/utils';

const LEVEL_FILTERS = [
  'All levels',
  'Start here',
  'Core',
  'Advanced',
] as const;

type LevelFilter = (typeof LEVEL_FILTERS)[number];

const LEVEL_ORDER: Record<ProGuideCourse['level'], number> = {
  'Start here': 0,
  Core: 1,
  Advanced: 2,
};

function playLesson(lesson: ProGuideLesson) {
  if (lesson.videoUrl) {
    window.open(lesson.videoUrl, '_blank', 'noopener,noreferrer');
  }
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
        'relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[16px] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--accent)_28%,#0f172a),color-mix(in_srgb,var(--accent-secondary)_22%,#111827))] text-white',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,white,transparent_45%)]" />
      <Video className="size-8 opacity-90" />
      <span className="absolute bottom-2 left-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
        {label}
      </span>
    </div>
  );
}

export function GuidesPanel() {
  const [level, setLevel] = useState<LevelFilter>('All levels');

  const courses = useMemo(() => {
    const filtered =
      level === 'All levels'
        ? PRO_GUIDE_COURSES
        : PRO_GUIDE_COURSES.filter((course) => course.level === level);

    return [...filtered].sort(
      (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level],
    );
  }, [level]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div
        className="-mx-0.5 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0"
        role="tablist"
        aria-label="Filter guides by level"
      >
        {LEVEL_FILTERS.map((option) => {
          const selected = level === option;
          const count =
            option === 'All levels'
              ? PRO_GUIDE_COURSES.length
              : PRO_GUIDE_COURSES.filter((course) => course.level === option)
                  .length;

          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setLevel(option)}
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

      {courses.length === 0 ? (
        <p className="text-sm text-foreground-secondary">
          No courses in this level yet.
        </p>
      ) : (
        <div className="space-y-8">
          {courses.map((course) => (
            <section key={course.id} className="space-y-3">
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
                  {course.lessonCount} lessons · {course.totalMinutes} min
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {course.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => playLesson(lesson)}
                    className="group text-left"
                    title={
                      lesson.videoUrl ? 'Play lesson' : 'Video uploading soon'
                    }
                  >
                    <div className="relative overflow-hidden rounded-[16px]">
                      <Thumb label={`${lesson.durationMinutes} min`} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
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
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="text-xs text-foreground-secondary">
        Educational research content only. Not medical advice or instructions for
        personal medical use.
      </p>
    </div>
  );
}
