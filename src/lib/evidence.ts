import type { EvidenceGrade, RegulatoryStatus } from '@/src/types';

export function evidenceLabel(grade: EvidenceGrade): string {
  const labels: Record<EvidenceGrade, string> = {
    strong_human: 'Strong human evidence',
    moderate_human: 'Moderate human evidence',
    limited_human: 'Limited human evidence',
    early_stage: 'Early-stage research',
    preclinical_only: 'Preclinical only',
    anecdotal: 'Anecdotal or unsupported',
    insufficient: 'Insufficient information',
  };
  return labels[grade];
}

export function regulatoryLabel(status: RegulatoryStatus, detail?: string): string {
  const labels: Record<RegulatoryStatus, string> = {
    fda_approved_specific: detail
      ? `FDA approved for a specific indication`
      : 'FDA approved for a specific indication',
    approved_outside_us: 'Approved outside the United States',
    investigational: 'Investigational',
    compounded_limited: 'Compounded in limited circumstances',
    not_fda_approved: 'Not FDA approved',
    research_stage: 'Research-stage compound',
    withdrawn: 'Withdrawn or discontinued',
    unknown: 'Unknown status',
  };
  return labels[status];
}

export function evidenceTone(
  grade: EvidenceGrade,
): 'success' | 'accent' | 'warning' | 'critical' | 'muted' {
  switch (grade) {
    case 'strong_human':
      return 'success';
    case 'moderate_human':
      return 'accent';
    case 'limited_human':
    case 'early_stage':
      return 'warning';
    case 'preclinical_only':
    case 'anecdotal':
      return 'critical';
    default:
      return 'muted';
  }
}
