'use client';

import type { CSSProperties } from 'react';

import { Logo } from '@/src/components/brand/logo';
import { SUGGESTED_PROMPTS } from '@/src/constants/chat';
import { cn } from '@/src/lib/utils';

export type EmptyChatProps = {
  onSelectPrompt?: (prompt: string) => void;
  className?: string;
};

const PROMPTS = SUGGESTED_PROMPTS.slice(0, 4);

function staggerStyle(index: number): CSSProperties {
  return { animationDelay: `${120 + index * 60}ms` };
}

export function EmptyChat({ onSelectPrompt, className }: EmptyChatProps) {
  return (
    <div
      className={cn(
        'flex min-h-full flex-1 flex-col items-center justify-center px-4 py-8',
        className,
      )}
    >
      <div className="flex w-full max-w-xl flex-col items-center">
        <Logo variant="mark" size="md" className="mb-5 opacity-90 sm:hidden" />
        <Logo variant="full" size="md" className="mb-5 hidden sm:block" />

        <h2 className="text-center text-[28px] font-semibold tracking-tight text-foreground sm:font-[family-name:var(--font-display)] sm:text-4xl">
          How can I help you?
        </h2>

        <div className="mt-8 flex w-full flex-col gap-2.5 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-3">
          {PROMPTS.map((prompt, index) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt?.(prompt)}
              style={staggerStyle(index)}
              className={cn(
                'empty-prompt-item rounded-[18px] border border-border bg-transparent px-4 py-3.5 text-left text-[14px] leading-snug text-foreground transition-colors',
                'hover:bg-surface-secondary active:bg-surface-secondary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                'sm:px-5 sm:py-5 sm:text-[15px] sm:font-medium',
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
