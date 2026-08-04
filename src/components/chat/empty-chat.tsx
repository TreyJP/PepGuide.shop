'use client';

import { SUGGESTED_PROMPTS } from '@/src/constants/chat';
import { cn } from '@/src/lib/utils';

export type EmptyChatProps = {
  onSelectPrompt?: (prompt: string) => void;
  className?: string;
};

export function EmptyChat({ onSelectPrompt, className }: EmptyChatProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center px-4 py-12',
        className,
      )}
    >
      <p className="mb-6 max-w-md text-center text-base text-foreground-secondary">
        Ask about a peptide, mechanism, or research goal.
      </p>

      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt?.(prompt)}
            className={cn(
              'rounded-[14px] border border-border bg-surface px-4 py-3 text-left text-sm text-foreground',
              'transition-all hover:border-accent/30 hover:bg-accent-muted/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
