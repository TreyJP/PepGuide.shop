import type { CycleFrequency } from '@/src/types';

export const CYCLE_FREQUENCIES: Array<{
  id: CycleFrequency;
  label: string;
}> = [
  { id: 'daily', label: 'Daily' },
  { id: 'twice_daily', label: 'Twice daily' },
  { id: 'eod', label: 'Every other day' },
  { id: '2x_week', label: '2× / week' },
  { id: '3x_week', label: '3× / week' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'as_needed', label: 'As needed' },
  { id: 'custom', label: 'Custom' },
];

export function frequencyLabel(
  frequency: CycleFrequency,
  custom?: string,
): string {
  if (frequency === 'custom' && custom?.trim()) return custom.trim();
  return (
    CYCLE_FREQUENCIES.find((item) => item.id === frequency)?.label ?? frequency
  );
}
