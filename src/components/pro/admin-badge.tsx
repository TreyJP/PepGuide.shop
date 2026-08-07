'use client';

import { Shield } from 'lucide-react';

import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';

export function AdminBadge({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Badge
      variant="accent"
      className={cn(
        'gap-1 border-accent/30 bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] font-semibold',
        compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        className,
      )}
    >
      <Shield className={compact ? 'size-2.5' : 'size-3'} aria-hidden />
      {compact ? 'Admin' : 'PepGuide Admin'}
    </Badge>
  );
}

export function AuthorLabel({
  name,
  isAdmin,
  className,
  onClick,
}: {
  name: string;
  isAdmin?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const nameClass = cn(
    'text-sm font-medium',
    isAdmin ? 'text-accent' : 'text-foreground',
    onClick && 'hover:underline',
  );

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      {onClick ? (
        <button type="button" onClick={onClick} className={nameClass}>
          {name}
        </button>
      ) : (
        <span className={nameClass}>{name}</span>
      )}
      {isAdmin ? <AdminBadge compact /> : null}
    </span>
  );
}
