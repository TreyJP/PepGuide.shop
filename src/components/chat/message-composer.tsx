'use client';

import { ArrowUp, Clock } from 'lucide-react';
import {
  useCallback,
  useEffect,
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
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = controlledValue ?? internalValue;
  const setValue = onChange ?? setInternalValue;
  const charCount = value.length;
  const isOverLimit = charCount > MESSAGE_LIMITS.maxInputChars;
  const canSubmit = value.trim().length > 0 && !disabled && !loading && !isOverLimit;

  // Pull the composer snug to the keyboard — avoid stacked safe-area gap on iOS.
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const sync = () => {
      const keyboardInset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      root.style.setProperty('--keyboard-inset', `${Math.round(keyboardInset)}px`);
    };

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
      root.style.removeProperty('--keyboard-inset');
    };
  }, []);

  const handleSubmit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || !canSubmit) return;
      onSubmit(trimmed);
      setValue('');
      // Keep focus for follow-ups without forcing an extra viewport jump.
      textareaRef.current?.focus({ preventScroll: true });
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
        'chat-composer-shell border-t px-3 backdrop-blur-sm sm:px-4',
        // When the keyboard is up, drop safe-area padding so the field sits snug.
        focused || 'max-sm:[padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]',
        focused ? 'py-2' : 'py-2.5 sm:py-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl flex-col gap-1.5 sm:gap-3"
      >
        <div className="chat-composer-box relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            enterKeyHint="send"
            placeholder={
              loading
                ? 'PepGuide is researching…'
                : 'Ask about a peptide, mechanism, or research goal…'
            }
            rows={focused ? 1 : 2}
            className={cn(
              'w-full resize-none rounded-[18px] bg-transparent px-3 py-2.5 pr-14 text-sm text-foreground sm:px-4 sm:py-3.5',
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
            className="absolute bottom-2 right-2 size-10 rounded-[12px] sm:bottom-3 sm:right-3 sm:size-9"
            aria-label={loading ? 'Generating response' : 'Send message'}
          >
            {!loading ? <ArrowUp className="size-4" /> : null}
          </Button>
        </div>

        <div
          className={cn(
            'items-start justify-between gap-3 px-1 text-xs text-foreground-secondary',
            focused ? 'hidden sm:flex' : 'flex',
          )}
        >
          <span className="flex min-w-0 flex-col gap-1">
            <span className="hidden items-center gap-1 sm:flex">
              <Clock className="size-3 shrink-0" />
              Enter to send · Shift+Enter for new line
            </span>
            <span className="hidden leading-relaxed text-foreground-secondary/80 sm:inline">
              {BRAND.emptyChatNotice}
            </span>
          </span>
          <span
            className={cn(
              'shrink-0 tabular-nums',
              isOverLimit ? 'text-critical' : 'hidden sm:inline',
            )}
          >
            {charCount.toLocaleString()} /{' '}
            {MESSAGE_LIMITS.maxInputChars.toLocaleString()}
          </span>
        </div>
      </form>
    </div>
  );
}
