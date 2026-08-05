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
        'chat-composer-shell border-t px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-[max(1rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-2.5 sm:gap-3">
        <div className="chat-composer-box relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              loading
                ? 'PepGuide is researching…'
                : 'Ask about a peptide, mechanism, or research goal…'
            }
            rows={2}
            className={cn(
              'w-full resize-none rounded-[18px] bg-transparent px-3 py-3 pr-14 text-sm text-foreground sm:px-4 sm:py-3.5',
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
            aria-label={loading ? 'Generating response' : 'Send message'}
          >
            {!loading ? <ArrowUp className="size-4" /> : null}
          </Button>
        </div>

        <div className="flex items-start justify-between gap-3 px-1 text-xs text-foreground-secondary">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="hidden items-center gap-1 sm:flex">
              <Clock className="size-3 shrink-0" />
              Enter to send · Shift+Enter for new line
            </span>
            <span className="leading-relaxed text-foreground-secondary/80">
              {BRAND.emptyChatNotice}
            </span>
          </span>
          <span className={cn('shrink-0 tabular-nums', isOverLimit && 'text-critical')}>
            {charCount.toLocaleString()} / {MESSAGE_LIMITS.maxInputChars.toLocaleString()}
          </span>
        </div>
      </form>
    </div>
  );
}
