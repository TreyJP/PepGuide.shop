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
  const canSubmit =
    value.trim().length > 0 && !disabled && !loading && !isOverLimit;

  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const sync = () => {
      const raw = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      // Ignore small chrome shifts; only lift for a real keyboard.
      const inset = raw > 120 ? Math.round(raw) : 0;
      root.style.setProperty('--keyboard-inset', `${inset}px`);
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

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleSubmit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || !canSubmit) return;
      onSubmit(trimmed);
      setValue('');
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
        'chat-composer-shell px-3 pt-1 sm:px-4 sm:pt-3',
        // Keep the pill snug — no extra disclaimer strip / oversized safe gap.
        focused
          ? 'pb-1'
          : 'pb-1 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-3xl flex-col gap-1 sm:gap-2"
      >
        <div className="chat-composer-box relative flex items-end px-2 py-1.5 sm:px-3 sm:py-2.5">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            enterKeyHint="send"
            placeholder={loading ? 'PepGuide is researching…' : 'Ask anything'}
            rows={1}
            className={cn(
              'max-h-36 min-h-[40px] w-full resize-none bg-transparent py-2 pl-2 pr-12 text-[16px] leading-6 text-foreground sm:min-h-[24px] sm:text-sm',
              'placeholder:text-foreground-secondary/80',
              'focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label={loading ? 'Generating response' : 'Send message'}
            className={cn(
              'absolute bottom-2 right-2 inline-flex size-8 items-center justify-center rounded-full transition-colors sm:bottom-2.5 sm:right-2.5',
              canSubmit
                ? 'bg-foreground text-white'
                : 'bg-[#d9d9d9] text-white',
              loading && 'opacity-70',
            )}
          >
            {loading ? (
              <span className="size-3.5 animate-pulse rounded-full bg-white/80" />
            ) : (
              <ArrowUp className="size-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <div className="hidden items-start justify-between gap-3 px-1 text-xs text-foreground-secondary sm:flex">
          <span className="flex min-w-0 flex-col gap-1">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 shrink-0" />
              Enter to send · Shift+Enter for new line
            </span>
            <span className="leading-relaxed text-foreground-secondary/80">
              {BRAND.emptyChatNotice}
            </span>
          </span>
          <span
            className={cn(
              'shrink-0 tabular-nums',
              isOverLimit && 'text-critical',
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
