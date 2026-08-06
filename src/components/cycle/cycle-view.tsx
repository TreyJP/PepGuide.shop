'use client';

import { MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { frequencyLabel } from '@/src/constants/cycle';
import type { CycleItem } from '@/src/types';

export type CycleViewProps = {
  items: CycleItem[];
  loading: boolean;
  onAdd: () => void;
  onAskChat: () => void;
  onEdit: (item: CycleItem) => void;
  onDelete: (item: CycleItem) => void;
};

export function CycleView({
  items,
  loading,
  onAdd,
  onAskChat,
  onEdit,
  onDelete,
}: CycleViewProps) {
  return (
    <div>
      <div className="cycle-stage cycle-rise">
        <div className="cycle-stage__halo" aria-hidden />
        <h1>Cycle</h1>
        <p>
          Your research log of peptides, dose, and frequency. Educational only —
          not medical advice.
        </p>
        <div className="cycle-stage__actions">
          <Button size="sm" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add peptide
          </Button>
          <Button size="sm" variant="secondary" onClick={onAskChat}>
            <MessageSquare className="size-3.5" />
            Ask in chat
          </Button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <p className="cycle-empty">Loading your log…</p>
      ) : items.length === 0 ? (
        <p className="cycle-empty">
          Nothing in your cycle yet. Add a peptide here, or open a dosing card
          in chat and choose Add to cycle.
        </p>
      ) : (
        <div className="cycle-mosaic">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="cycle-tile cycle-rise"
              style={{ animationDelay: `${70 + index * 65}ms` }}
            >
              <div className="flex items-start justify-between gap-2 pl-1">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--cycle-navy)]">
                  {item.name}
                </h2>
                <div className="cycle-item-actions">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <dl className="cycle-tile__dose">
                <div>
                  <dt>Dose</dt>
                  <dd>{item.dose}</dd>
                </div>
                <div>
                  <dt>Frequency</dt>
                  <dd>
                    {frequencyLabel(item.frequency, item.frequencyLabel)}
                  </dd>
                </div>
              </dl>
              {item.notes ? (
                <p className="mt-3 pl-1 text-sm text-foreground-secondary">
                  {item.notes}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
