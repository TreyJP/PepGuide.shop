'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { trackAnalyticsEvent } from '@/src/services/firestore/analytics';

export type CouponCodeButtonProps = {
  code: string;
  discountLabel: string;
  className?: string;
  partnerId?: string;
  partnerLabel?: string;
  peptideId?: string;
  peptideName?: string;
};

/** Formats labels like "10% off" → "-10%". */
function toMinusPercent(discountLabel: string): string {
  const match = discountLabel.match(/(\d+)\s*%/);
  if (match) return `-${match[1]}%`;
  return discountLabel.startsWith('-') ? discountLabel : `-${discountLabel}`;
}

export function CouponCodeButton({
  code,
  discountLabel,
  className,
  partnerId,
  partnerLabel,
  peptideId,
  peptideName,
}: CouponCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const percent = toMinusPercent(discountLabel);
  const normalizedCode = code.trim().toUpperCase() || 'PEPGUIDE';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const input = document.createElement('input');
      input.value = normalizedCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }

    void trackAnalyticsEvent({
      name: 'coupon_copy',
      meta: {
        code: normalizedCode,
        partnerId: partnerId ?? null,
        partnerLabel: partnerLabel ?? null,
        peptideId: peptideId ?? null,
        peptideName: peptideName ?? null,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      title="Copy coupon code"
      className={cn(
        'inline-flex h-8 w-full max-w-[9.75rem] items-center justify-between gap-2 rounded-[10px] border border-dashed border-accent/40 bg-accent-muted/70 px-2.5 text-left transition-all hover:border-accent hover:bg-accent-muted',
        className,
      )}
    >
      <span className="min-w-0 truncate font-mono text-xs font-semibold tracking-[0.03em] text-foreground">
        {copied ? (
          'Copied'
        ) : (
          <>
            <span className="text-accent">{percent}</span>{' '}
            <span>{normalizedCode}</span>
          </>
        )}
      </span>
      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </span>
    </button>
  );
}
