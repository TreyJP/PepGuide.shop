'use client';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';

import { Logo } from '@/src/components/brand/logo';
import { BRAND } from '@/src/constants/brand';
import { SUGGESTED_PROMPTS } from '@/src/constants/chat';
import { PROMPT_CATEGORIES } from '@/src/constants/empty-prompt-layouts';
import { cn } from '@/src/lib/utils';

export type EmptyChatProps = {
  onSelectPrompt?: (prompt: string) => void;
  className?: string;
};

const PROMPTS = SUGGESTED_PROMPTS.slice(0, 4);

function staggerStyle(index: number): CSSProperties {
  return { animationDelay: `${140 + index * 70}ms` };
}

export function EmptyChat({ onSelectPrompt, className }: EmptyChatProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14',
        className,
      )}
    >
      <div className="empty-prompts mx-auto w-full max-w-3xl">
        <div className="empty-prompts-hero mb-9 flex flex-col items-center text-center">
          <Logo variant="full" size="md" className="mb-5" />
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent-muted/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <Sparkles className="size-3" />
            Research starters
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {BRAND.headline}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-secondary">
            Begin with a curated question — or ask anything in the composer.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PROMPTS.map((prompt, index) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt?.(prompt)}
              style={staggerStyle(index)}
              className={cn(
                'empty-prompt-item group relative overflow-hidden rounded-[18px] border border-border bg-surface px-5 py-5 text-left shadow-[0_1px_0_rgba(10,27,58,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_16px_36px_rgba(0,87,255,0.1)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[linear-gradient(90deg,var(--accent),color-mix(in_srgb,var(--accent)_40%,white))] transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                {PROMPT_CATEGORIES[index]}
              </span>
              <span className="mt-2.5 block text-[15px] font-medium leading-snug text-foreground">
                {prompt}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                Ask PepGuide
                <ArrowUpRight className="size-3.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
