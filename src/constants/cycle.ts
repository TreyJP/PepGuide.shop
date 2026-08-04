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

/** Lowest numeric amount + unit from a research dosing blurb (e.g. "100–300 mcg" → "100 mcg"). */
export function extractMinimumDose(researchDosing?: string): string | null {
  if (!researchDosing?.trim()) return null;
  const match = researchDosing.match(
    /~?\s*(\d+(?:\.\d+)?)\s*(?:[–—-]\s*~?\s*\d+(?:\.\d+)?)?\s*(mcg|µg|ug|mg)\b/i,
  );
  if (!match) return null;
  const amount = match[1];
  const unit = match[2].toLowerCase() === 'ug' || match[2] === 'µg' ? 'mcg' : match[2].toLowerCase();
  return `${amount} ${unit}`;
}
