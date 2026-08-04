import type { HTMLAttributes } from 'react';

import { cn } from '@/src/lib/utils';

const variantStyles = {
  default: 'bg-surface-secondary text-foreground border-border',
  accent: 'bg-accent-muted text-accent border-accent/20',
  success: 'bg-success-muted text-success border-success/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  critical: 'bg-critical-muted text-critical border-critical/20',
  muted: 'bg-surface-secondary text-foreground-secondary border-border',
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
