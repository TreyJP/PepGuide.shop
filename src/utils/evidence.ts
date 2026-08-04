import type { EvidenceGrade, RegulatoryStatus } from '@/src/types';

export function evidenceLabel(grade: EvidenceGrade): string {
  switch (grade) {
    case 'strong_human':
      return 'Strong human evidence';
    case 'moderate_human':
      return 'Moderate human evidence';
    case 'limited_human':
      return 'Limited human evidence';
    case 'early_stage':
      return 'Early-stage research';
    case 'preclinical_only':
      return 'Preclinical only';
    case 'anecdotal':
      return 'Anecdotal or unsupported';
    case 'insufficient':
      return 'Insufficient information';
    default:
      return 'Insufficient information';
  }
}

export function regulatoryLabel(
  status: RegulatoryStatus,
  detail?: string,
): string {
  switch (status) {
    case 'fda_approved_specific':
      return detail
        ? `FDA approved for a specific indication: ${detail}`
        : 'FDA approved for a specific indication';
    case 'approved_outside_us':
      return 'Approved outside the United States';
    case 'investigational':
      return 'Investigational';
    case 'compounded_limited':
      return 'Compounded in limited circumstances';
    case 'not_fda_approved':
      return 'Not FDA approved';
    case 'research_stage':
      return 'Research-stage compound';
    case 'withdrawn':
      return 'Withdrawn or discontinued';
    case 'unknown':
      return 'Unknown status';
    default:
      return 'Unknown status';
  }
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
