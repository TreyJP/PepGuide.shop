'use client';

import { cn } from '@/src/lib/utils';

export const TRUSTED_SOURCE_LABEL = 'Trusted Source';
export const TRUSTED_SOURCE_TOOLTIP =
  'Independently tested by PepGuide team';
export const LOWEST_PRICE_LABEL = 'Lowest price';

export function TrustedSourceBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn('cursor-help', className)}
      title={TRUSTED_SOURCE_TOOLTIP}
      aria-label={TRUSTED_SOURCE_TOOLTIP}
    >
      {TRUSTED_SOURCE_LABEL}
    </span>
  );
}

export function LowestPriceBadge({
  className,
}: {
  className?: string;
}) {
  return <span className={cn(className)}>{LOWEST_PRICE_LABEL}</span>;
}
