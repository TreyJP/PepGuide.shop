import { cn } from '@/src/lib/utils';

export type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[12px] bg-surface-secondary',
        className,
      )}
    />
  );
}
