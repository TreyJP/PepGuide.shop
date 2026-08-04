'use client';

import { ArrowUp, Clock } from 'lucide-react';
import {
  useCallback,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import { Button } from '@/src/components/ui/button';
import { BRAND } from '@/src/constants/brand';
import { MESSAGE_LIMITS } from '@/src/constants/chat';
import { cn } from '@/src/lib/utils';

export type MessageComposerProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function MessageComposer({
  value: controlledValue,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  className,
}: MessageComposerProps) {
  const [internalValue, setInternalValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = controlledValue ?? internalValue;
  const setValue = onChange ?? setInternalValue;
  const charCount = value.length;
  const isOverLimit = charCount > MESSAGE_LIMITS.maxInputChars;
  const canSubmit = value.trim().length > 0 && !disabled && !loading && !isOverLimit;

  const handleSubmit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || !canSubmit) return;
      onSubmit(trimmed);
      setValue('');
      textareaRef.current?.focus();
    },
    [canSubmit, onSubmit, setValue, value],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'border-t border-border bg-surface/80 px-4 py-4 backdrop-blur-sm',
        className,
      )}
    >
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="relative rounded-[18px] border border-border bg-surface-elevated shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            placeholder="Ask about a peptide, mechanism, or research goal…"
            rows={3}
            className={cn(
              'w-full resize-none rounded-[18px] bg-transparent px-4 py-3.5 pr-14 text-sm text-foreground',
              'placeholder:text-foreground-secondary/70',
              'focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          />
          <Button
            type="submit"
            size="icon"
            loading={loading}
            disabled={!canSubmit}
            className="absolute bottom-3 right-3 size-9 rounded-[12px]"
            aria-label="Send message"
          >
            {!loading ? <ArrowUp className="size-4" /> : null}
          </Button>
        </div>

        <div className="flex items-start justify-between gap-3 px-1 text-xs text-foreground-secondary">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-1">
              <Clock className="size-3 shrink-0" />
              Enter to send · Shift+Enter for new line
            </span>
            <span className="leading-relaxed text-foreground-secondary/80">
              {BRAND.emptyChatNotice}
            </span>
          </span>
          <span className={cn('shrink-0', isOverLimit && 'text-critical')}>
            {charCount.toLocaleString()} / {MESSAGE_LIMITS.maxInputChars.toLocaleString()}
          </span>
        </div>
      </form>
    </div>
  );
}
