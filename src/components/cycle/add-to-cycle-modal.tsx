'use client';

import { useEffect, useState } from 'react';

import { ModalShell } from '@/src/components/ui/modal-shell';
import { Button } from '@/src/components/ui/button';
import {
  CYCLE_FREQUENCIES,
  extractMinimumDose,
  frequencyLabel,
} from '@/src/constants/cycle';
import { useCycleStore } from '@/src/stores/cycle-store';
import { useUiStore } from '@/src/stores/ui-store';
import { useAuthStore } from '@/src/stores/auth-store';
import type { CycleFrequency } from '@/src/types';

export type AddToCycleModalProps = {
  open: boolean;
  peptideId: string;
  peptideName: string;
  /** Research dosing text — used only for a min-dose placeholder, never autofilled. */
  suggestedDose?: string;
  onClose: () => void;
  onAdded?: () => void;
};

export function AddToCycleModal({
  open,
  peptideId,
  peptideName,
  suggestedDose = '',
  onClose,
  onAdded,
}: AddToCycleModalProps) {
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const addItem = useCycleStore((state) => state.addItem);
  const isCustomEntry =
    peptideId === 'custom' ||
    !peptideName.trim() ||
    peptideName.trim().toLowerCase() === 'custom peptide';
  const [name, setName] = useState(peptideName);
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState<CycleFrequency>('weekly');
  const [customFrequency, setCustomFrequency] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const minDoseHint = extractMinimumDose(suggestedDose);

  useEffect(() => {
    if (!open) return;
    setName(isCustomEntry ? '' : peptideName);
    setDose('');
    setFrequency('weekly');
    setCustomFrequency('');
    setNotes('');
    setError(null);
  }, [open, peptideId, peptideName, isCustomEntry]);

  const handleSave = async () => {
    if (!user) {
      openSignInModal('Sign in to add peptides to your cycle log.');
      return;
    }
    if (!name.trim()) {
      setError('Enter a peptide name.');
      return;
    }
    if (!dose.trim()) {
      setError('Enter a dose.');
      return;
    }
    if (frequency === 'custom' && !customFrequency.trim()) {
      setError('Enter a custom frequency.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addItem({
        peptideId,
        name: name.trim(),
        dose: dose.trim(),
        frequency,
        frequencyLabel:
          frequency === 'custom' ? customFrequency.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      onAdded?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add to cycle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      titleId="add-to-cycle-title"
      eyebrow="Cycle log"
      title={isCustomEntry ? 'Add to cycle' : peptideName}
      description="Track name, dose, and frequency for your research log — not a prescription."
      className="max-w-md"
      footer="Educational tracker only. Confirm any personal use with a qualified clinician."
    >
      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Peptide name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
            placeholder="e.g. GL3RT"
            autoFocus={isCustomEntry}
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Dose</span>
          <input
            value={dose}
            onChange={(event) => setDose(event.target.value)}
            className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
            placeholder={minDoseHint ? `e.g. ${minDoseHint}` : 'e.g. 100 mcg'}
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Frequency</span>
          <select
            value={frequency}
            onChange={(event) =>
              setFrequency(event.target.value as CycleFrequency)
            }
            className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
          >
            {CYCLE_FREQUENCIES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {frequency === 'custom' ? (
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-foreground">Custom frequency</span>
            <input
              value={customFrequency}
              onChange={(event) => setCustomFrequency(event.target.value)}
              className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
              placeholder="e.g. Mon / Thu"
            />
          </label>
        ) : null}

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className="w-full resize-none rounded-[12px] border border-border bg-surface px-3 py-2"
            placeholder="Timing, goals, etc."
          />
        </label>

        <p className="text-xs text-foreground-secondary">
          Will show as{' '}
          <span className="font-medium text-foreground">
            {name.trim() || '—'} · {dose.trim() || '—'} ·{' '}
            {frequencyLabel(frequency, customFrequency)}
          </span>
        </p>

        {error ? <p className="text-sm text-critical">{error}</p> : null}

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Adding…' : 'Add to cycle'}
        </Button>
      </div>
    </ModalShell>
  );
}
