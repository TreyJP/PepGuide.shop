'use client';

import { Check, Minus } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { buildPartnerLabPanel } from '@/src/data/affiliates/lab-tests';
import { cn } from '@/src/lib/utils';
import { usePartnersStore } from '@/src/stores/partners-store';

export type PartnerLabScoreProps = {
  vendorId: string;
  className?: string;
};

type TooltipPos = { top: number; left: number };

export function PartnerLabScore({ vendorId, className }: PartnerLabScoreProps) {
  const partner = usePartnersStore((state) =>
    state.partners.find((item) => item.id === vendorId),
  );
  const panel = buildPartnerLabPanel(vendorId, partner?.labTests);
  const unknown = panel.passedCount == null;
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<TooltipPos>({ top: 0, left: 0 });
  const tooltipId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 216;
    const left = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - width - 8,
    );
    setPos({
      top: rect.bottom + 6,
      left,
    });
  };

  const show = () => {
    updatePosition();
    setOpen(true);
  };

  const hide = () => setOpen(false);

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`Lab tests ${panel.scoreLabel}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={cn(
          'inline-flex h-5 shrink-0 cursor-default items-center rounded-[6px] px-1.5 text-[10px] font-semibold tabular-nums ring-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent',
          unknown
            ? 'bg-surface text-foreground-secondary ring-border'
            : panel.passedCount === panel.total
              ? 'bg-success-muted text-success ring-success/25'
              : 'bg-accent-muted text-accent ring-accent/25',
        )}
      >
        {panel.scoreLabel}
      </span>

      {mounted && open
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              onMouseEnter={show}
              onMouseLeave={hide}
              style={{ top: pos.top, left: pos.left }}
              className="pointer-events-auto fixed z-[80] w-[13.5rem] rounded-[12px] border border-border bg-surface p-2.5 shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
            >
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
                Lab tests · {panel.scoreLabel}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {panel.results.map((result) => {
                  const passed = result.status === true;
                  return (
                    <li
                      key={result.id}
                      className="flex items-center gap-2 rounded-[8px] px-1.5 py-1 text-xs"
                    >
                      <span
                        className={cn(
                          'inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] ring-1',
                          passed
                            ? 'bg-success-muted text-success ring-success/30'
                            : 'bg-surface text-foreground-secondary ring-border',
                        )}
                        aria-hidden
                      >
                        {passed ? (
                          <Check className="size-2.5 stroke-[2.5]" />
                        ) : (
                          <Minus className="size-2.5" />
                        )}
                      </span>
                      <span
                        className={cn(
                          passed ? 'text-foreground' : 'text-foreground-secondary',
                        )}
                      >
                        {result.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
