'use client';

import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export type ModalShellProps = {
  open: boolean;
  title: string;
  titleId: string;
  eyebrow?: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Extra header content below the title block. */
  headerExtra?: ReactNode;
};

/**
 * Lightweight modal shell — no backdrop-blur (major FPS cost over painted pages).
 */
export function ModalShell({
  open,
  title,
  titleId,
  eyebrow,
  description,
  onClose,
  children,
  footer,
  className,
  headerExtra,
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[color:var(--overlay)]"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_16px_40px_rgba(15,23,42,0.18)]',
          'motion-safe:animate-fade-up [contain:layout_paint] [transform:translateZ(0)]',
          className,
        )}
      >
        <div className="shrink-0 border-b border-border bg-surface px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  {eyebrow}
                </p>
              ) : null}
              <h2
                id={titleId}
                className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground"
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-sm text-foreground-secondary">{description}</p>
              ) : null}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              aria-label="Close"
              className="size-9 shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
          {headerExtra}
        </div>

        <div className="scrollbar-theme min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [contain:content]">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-border px-5 py-3 text-xs leading-relaxed text-foreground-secondary">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
