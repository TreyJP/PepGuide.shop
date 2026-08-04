import { Badge, type BadgeVariant } from '@/src/components/ui/badge';
import { evidenceLabel, evidenceTone } from '@/src/lib/evidence';
import type { EvidenceGrade } from '@/src/types';

const toneToVariant: Record<
  ReturnType<typeof evidenceTone>,
  BadgeVariant
> = {
  success: 'success',
  accent: 'accent',
  warning: 'warning',
  critical: 'critical',
  muted: 'muted',
};

export type EvidenceBadgeProps = {
  grade: EvidenceGrade;
  className?: string;
};

export function EvidenceBadge({ grade, className }: EvidenceBadgeProps) {
  return (
    <Badge variant={toneToVariant[evidenceTone(grade)]} className={className}>
      {evidenceLabel(grade)}
    </Badge>
  );
}
