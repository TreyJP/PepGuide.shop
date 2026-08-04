export const darkColors = {
  background: '#09090B',
  surface: '#111318',
  surfaceSecondary: '#181B21',
  surfaceElevated: '#1D2128',
  foreground: '#F8FAFC',
  foregroundSecondary: '#98A2B3',
  border: '#2A2F38',
  accent: '#7C5CFC',
  accentSecondary: '#22D3EE',
  success: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  overlay: 'rgba(9, 9, 11, 0.72)',
  accentMuted: 'rgba(124, 92, 252, 0.16)',
  accentSecondaryMuted: 'rgba(34, 211, 238, 0.14)',
  criticalMuted: 'rgba(239, 68, 68, 0.14)',
  warningMuted: 'rgba(245, 158, 11, 0.14)',
  successMuted: 'rgba(34, 197, 94, 0.14)',
} as const;

export const lightColors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F3F7',
  surfaceElevated: '#FFFFFF',
  foreground: '#0F172A',
  foregroundSecondary: '#64748B',
  border: '#E2E8F0',
  accent: '#6D4FE8',
  accentSecondary: '#0891B2',
  success: '#16A34A',
  warning: '#D97706',
  critical: '#DC2626',
  overlay: 'rgba(15, 23, 42, 0.45)',
  accentMuted: 'rgba(109, 79, 232, 0.12)',
  accentSecondaryMuted: 'rgba(8, 145, 178, 0.1)',
  criticalMuted: 'rgba(220, 38, 38, 0.1)',
  warningMuted: 'rgba(217, 119, 6, 0.1)',
  successMuted: 'rgba(22, 163, 74, 0.1)',
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  foreground: string;
  foregroundSecondary: string;
  border: string;
  accent: string;
  accentSecondary: string;
  success: string;
  warning: string;
  critical: string;
  overlay: string;
  accentMuted: string;
  accentSecondaryMuted: string;
  criticalMuted: string;
  warningMuted: string;
  successMuted: string;
};
export type ColorSchemeName = 'light' | 'dark';

