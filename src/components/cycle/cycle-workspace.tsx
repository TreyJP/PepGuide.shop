'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AddToCycleModal } from '@/src/components/cycle/add-to-cycle-modal';
import '@/src/components/cycle/cycle-designs.css';
import { CycleView } from '@/src/components/cycle/cycle-view';
import { Button } from '@/src/components/ui/button';
import { CYCLE_FREQUENCIES } from '@/src/constants/cycle';
import { useAuthStore } from '@/src/stores/auth-store';
import { useCycleStore } from '@/src/stores/cycle-store';
import { useUiStore } from '@/src/stores/ui-store';
import type { CycleFrequency, CycleItem } from '@/src/types';

export function CycleWorkspace() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const items = useCycleStore((state) => state.items);
  const loading = useCycleStore((state) => state.loading);
  const loadItems = useCycleStore((state) => state.loadItems);
  const updateItem = useCycleStore((state) => state.updateItem);
  const deleteItem = useCycleStore((state) => state.deleteItem);

  const [editing, setEditing] = useState<CycleItem | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState<CycleFrequency>('weekly');
  const [customFrequency, setCustomFrequency] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) void loadItems();
  }, [user, loadItems]);

  useEffect(() => {
    if (!editing) return;
    setDose(editing.dose);
    setFrequency(editing.frequency);
    setCustomFrequency(editing.frequencyLabel ?? '');
    setNotes(editing.notes ?? '');
  }, [editing]);

  if (!user) {
    return (
      <div className="cycle-root flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--cycle-navy)]">
          Cycle log
        </h1>
        <p className="max-w-md text-sm text-foreground-secondary">
          Sign in to track peptides, doses, and frequency from chat.
        </p>
        <Button
          onClick={() => openSignInModal('Sign in to use your cycle log.')}
        >
          Sign in
        </Button>
      </div>
    );
  }

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return;
    setSaving(true);
    try {
      await updateItem(editing.id, {
        name: editing.name.trim(),
        dose: dose.trim(),
        frequency,
        frequencyLabel:
          frequency === 'custom' ? customFrequency.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cycle-root h-full overflow-y-auto">
      <CycleView
        items={items}
        loading={loading}
        onAdd={() => setManualOpen(true)}
        onAskChat={() => router.push('/chat')}
        onEdit={setEditing}
        onDelete={(item) => {
          if (window.confirm(`Remove ${item.name} from your cycle?`)) {
            void deleteItem(item.id);
          }
        }}
      />

      <AddToCycleModal
        open={manualOpen}
        peptideId="custom"
        peptideName="Custom peptide"
        onClose={() => setManualOpen(false)}
      />

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-[color:var(--overlay)]"
            aria-label="Close"
            onClick={() => setEditing(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[22px] border border-border bg-surface p-5 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Edit {editing.name}
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Peptide name</span>
                <input
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({ ...editing, name: event.target.value })
                  }
                  className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Dose</span>
                <input
                  value={dose}
                  onChange={(event) => setDose(event.target.value)}
                  className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Frequency</span>
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
                <input
                  value={customFrequency}
                  onChange={(event) => setCustomFrequency(event.target.value)}
                  className="h-10 w-full rounded-[12px] border border-border bg-surface px-3 text-sm"
                  placeholder="Custom frequency"
                />
              ) : null}
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                className="w-full resize-none rounded-[12px] border border-border bg-surface px-3 py-2 text-sm"
                placeholder="Notes"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
