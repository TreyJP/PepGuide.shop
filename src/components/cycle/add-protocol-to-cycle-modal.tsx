'use client';

import { useEffect, useMemo, useState } from 'react';

import { ModalShell } from '@/src/components/ui/modal-shell';
import { Button } from '@/src/components/ui/button';
import {
  CYCLE_FREQUENCIES,
  extractMinimumDose,
  frequencyLabel,
} from '@/src/constants/cycle';
import type { ProProtocol } from '@/src/data/pro/protocols';
import { useAuthStore } from '@/src/stores/auth-store';
import { useCycleStore } from '@/src/stores/cycle-store';
import { useUiStore } from '@/src/stores/ui-store';
import type { CycleFrequency } from '@/src/types';

export type AddProtocolToCycleModalProps = {
  open: boolean;
  protocol: ProProtocol | null;
  onClose: () => void;
  onAdded?: (count: number) => void;
};

type RowState = {
  peptideId: string;
  name: string;
  dose: string;
  frequency: CycleFrequency;
  included: boolean;
  alreadyInCycle: boolean;
};

export function AddProtocolToCycleModal({
  open,
  protocol,
  onClose,
  onAdded,
}: AddProtocolToCycleModalProps) {
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const addItem = useCycleStore((state) => state.addItem);
  const hasPeptide = useCycleStore((state) => state.hasPeptide);
  const loadItems = useCycleStore((state) => state.loadItems);
  const loaded = useCycleStore((state) => state.loaded);
  const [rows, setRows] = useState<RowState[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user && !loaded) void loadItems();
  }, [open, user, loaded, loadItems]);

  useEffect(() => {
    if (!open || !protocol) return;
    setError(null);
    setRows(
      protocol.peptides.map((peptide) => {
        const already = hasPeptide(peptide.peptideId);
        return {
          peptideId: peptide.peptideId,
          name: peptide.name,
          dose: extractMinimumDose(peptide.researchNote) ?? '',
          frequency: 'weekly' as CycleFrequency,
          included: !already,
          alreadyInCycle: already,
        };
      }),
    );
  }, [open, protocol, hasPeptide]);

  const selectedCount = useMemo(
    () => rows.filter((row) => row.included).length,
    [rows],
  );

  async function handleSave() {
    if (!user) {
      openSignInModal('Sign in to add protocols to your cycle log.');
      return;
    }
    if (!protocol) return;

    const toAdd = rows.filter((row) => row.included);
    if (toAdd.length === 0) {
      setError('Select at least one peptide to add.');
      return;
    }
    for (const row of toAdd) {
      if (!row.dose.trim()) {
        setError(`Enter a dose for ${row.name}.`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      let added = 0;
      for (const row of toAdd) {
        await addItem({
          peptideId: row.peptideId,
          name: row.name,
          dose: row.dose.trim(),
          frequency: row.frequency,
          frequencyLabel: frequencyLabel(row.frequency),
          notes: `From protocol: ${protocol.name}`,
        });
        added += 1;
      }
      onAdded?.(added);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to add protocol to cycle.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      open={open && Boolean(protocol)}
      onClose={onClose}
      titleId="add-protocol-cycle-title"
      eyebrow="Cycle log"
      title={protocol ? `Add “${protocol.name}”` : 'Add protocol'}
      description="Add stack peptides to your research cycle log. Adjust dose and frequency before saving."
      className="max-w-lg"
      footer="Educational tracker only. Confirm any personal use with a qualified clinician."
    >
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.peptideId}
            className="rounded-[14px] border border-border bg-surface-secondary/50 px-3 py-3"
          >
            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[var(--accent)]"
                checked={row.included}
                disabled={row.alreadyInCycle && !row.included}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setRows((current) =>
                    current.map((item) =>
                      item.peptideId === row.peptideId
                        ? { ...item, included: checked }
                        : item,
                    ),
                  );
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {row.name}
                  </span>
                  {row.alreadyInCycle ? (
                    <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
                      Already in cycle
                    </span>
                  ) : null}
                </span>
                {row.included ? (
                  <span className="mt-2 grid gap-2 sm:grid-cols-2">
                    <span className="block space-y-1">
                      <span className="text-xs font-medium text-foreground">
                        Dose
                      </span>
                      <input
                        value={row.dose}
                        onChange={(event) => {
                          const value = event.target.value;
                          setRows((current) =>
                            current.map((item) =>
                              item.peptideId === row.peptideId
                                ? { ...item, dose: value }
                                : item,
                            ),
                          );
                        }}
                        className="h-9 w-full rounded-[10px] border border-border bg-surface px-2.5 text-sm"
                        placeholder="e.g. 100 mcg"
                      />
                    </span>
                    <span className="block space-y-1">
                      <span className="text-xs font-medium text-foreground">
                        Frequency
                      </span>
                      <select
                        value={row.frequency}
                        onChange={(event) => {
                          const value = event.target.value as CycleFrequency;
                          setRows((current) =>
                            current.map((item) =>
                              item.peptideId === row.peptideId
                                ? { ...item, frequency: value }
                                : item,
                            ),
                          );
                        }}
                        className="h-9 w-full rounded-[10px] border border-border bg-surface px-2.5 text-sm"
                      >
                        {CYCLE_FREQUENCIES.filter(
                          (item) => item.id !== 'custom',
                        ).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </span>
                  </span>
                ) : null}
              </span>
            </label>
          </div>
        ))}

        {error ? <p className="text-sm text-critical">{error}</p> : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            loading={saving}
            disabled={selectedCount === 0}
            onClick={() => void handleSave()}
          >
            Add {selectedCount || ''} to cycle
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
