'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AddToCycleModal } from '@/src/components/cycle/add-to-cycle-modal';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { CYCLE_FREQUENCIES, frequencyLabel } from '@/src/constants/cycle';
import { useAuthStore } from '@/src/stores/auth-store';
import { useCycleStore } from '@/src/stores/cycle-store';
import { useUiStore } from '@/src/stores/ui-store';
import type { CycleFrequency, CycleItem } from '@/src/types';

export default function CyclePage() {
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
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Cycle log
        </h1>
        <p className="max-w-md text-sm text-foreground-secondary">
          Sign in to track peptides, doses, and frequency from chat.
        </p>
        <Button onClick={() => openSignInModal('Sign in to use your cycle log.')}>
          Sign in
        </Button>
      </div>
    );
  }

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateItem(editing.id, {
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
    <div className="h-full overflow-y-auto">
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Cycle
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            Your research log of peptides, dose, and frequency. Not medical
            advice.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/chat')}
          >
            Ask in chat
          </Button>
          <Button size="sm" onClick={() => setManualOpen(true)}>
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 p-6">
        {loading && items.length === 0 ? (
          <p className="text-sm text-foreground-secondary">Loading…</p>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nothing in your cycle yet</CardTitle>
              <CardDescription>
                From chat, open a peptide dosing card and choose{' '}
                <span className="font-medium text-foreground">Add to cycle</span>
                , or add one here.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground">
                    {item.name}
                  </h2>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
                        Dose
                      </dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {item.dose}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
                        Frequency
                      </dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {frequencyLabel(item.frequency, item.frequencyLabel)}
                      </dd>
                    </div>
                  </dl>
                  {item.notes ? (
                    <p className="mt-3 text-sm text-foreground-secondary">
                      {item.notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => setEditing(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove"
                    onClick={() => {
                      if (
                        window.confirm(`Remove ${item.name} from your cycle?`)
                      ) {
                        void deleteItem(item.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
