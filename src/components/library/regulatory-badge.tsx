import { Badge, type BadgeVariant } from '@/src/components/ui/badge';
import { regulatoryLabel } from '@/src/lib/evidence';
import type { RegulatoryStatus } from '@/src/types';

function regulatoryVariant(status: RegulatoryStatus): BadgeVariant {
  switch (status) {
    case 'fda_approved_specific':
    case 'approved_outside_us':
      return 'success';
    case 'investigational':
    case 'compounded_limited':
      return 'warning';
    case 'not_fda_approved':
    case 'withdrawn':
      return 'critical';
    case 'research_stage':
    case 'unknown':
    default:
      return 'muted';
  }
}

export type RegulatoryBadgeProps = {
  status: RegulatoryStatus;
  detail?: string;
  className?: string;
};

export function RegulatoryBadge({
  status,
  detail,
  className,
}: RegulatoryBadgeProps) {
  return (
    <Badge variant={regulatoryVariant(status)} className={className}>
      {regulatoryLabel(status, detail)}
    </Badge>
  );
}
