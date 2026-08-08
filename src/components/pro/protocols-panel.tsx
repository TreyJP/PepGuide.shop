'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/src/components/ui/badge';
import { PRO_PROTOCOLS, type ProProtocol } from '@/src/data/pro/protocols';
import { cn } from '@/src/lib/utils';

const DIFFICULTY_FILTERS = [
  'All levels',
  'Beginner-friendly',
  'Intermediate',
  'Advanced research',
] as const;

type DifficultyFilter = (typeof DIFFICULTY_FILTERS)[number];

const DIFFICULTY_ORDER: Record<ProProtocol['difficulty'], number> = {
  'Beginner-friendly': 0,
  Intermediate: 1,
  'Advanced research': 2,
};

function FocusTags({ protocol }: { protocol: ProProtocol }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {protocol.focus.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground-secondary"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function StackDetails({ protocol }: { protocol: ProProtocol }) {
  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {protocol.peptides.map((peptide, index) => (
          <li
            key={peptide.peptideId}
            className="rounded-[14px] bg-surface-secondary/70 px-3.5 py-3.5"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-[11px] font-semibold text-accent">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {peptide.name}
                  </p>
                  <p className="text-xs text-accent">{peptide.role}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground-secondary">
                  {peptide.researchNote}
                </p>
                <Link
                  href={`/library/${peptide.peptideId}`}
                  className="mt-2.5 inline-block text-xs font-semibold text-accent hover:underline"
                >
                  Open in Library →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <ul className="space-y-2">
        {protocol.notes.map((note) => (
          <li
            key={note}
            className="text-xs leading-relaxed text-foreground-secondary"
          >
            · {note}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProtocolPicker({
  protocols,
  selectedId,
  onSelect,
  variant,
}: {
  protocols: ProProtocol[];
  selectedId: string;
  onSelect: (id: string) => void;
  variant: 'mobile' | 'desktop';
}) {
  if (variant === 'mobile') {
    return (
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-secondary">
          Choose a stack
        </p>
        <div
          className="flex flex-col gap-2"
          role="listbox"
          aria-label="Protocol stacks"
        >
          {protocols.map((protocol) => {
            const selected = protocol.id === selectedId;
            return (
              <button
                key={protocol.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(protocol.id)}
                className={cn(
                  'w-full rounded-[14px] px-3.5 py-3 text-left transition-colors',
                  selected
                    ? 'bg-accent-muted text-accent'
                    : 'bg-surface-secondary/70 text-foreground-secondary hover:text-foreground',
                )}
              >
                <p className="text-sm font-medium leading-snug">
                  {protocol.name}
                </p>
                <p
                  className={cn(
                    'mt-0.5 text-[11px]',
                    selected ? 'text-accent/80' : 'text-foreground-secondary/85',
                  )}
                >
                  {protocol.goal}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside className="border-b border-border lg:border-b-0 lg:border-r">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-secondary">
          Stacks
        </p>
      </div>
      <div
        className="flex flex-col gap-1 p-2"
        role="listbox"
        aria-label="Protocol stacks"
      >
        {protocols.map((protocol) => {
          const selected = protocol.id === selectedId;
          return (
            <button
              key={protocol.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(protocol.id)}
              className={cn(
                'rounded-[12px] px-3 py-2.5 text-left transition-colors',
                selected
                  ? 'bg-accent-muted text-accent'
                  : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground',
              )}
            >
              <p className="text-sm font-medium">{protocol.name}</p>
              <p className="mt-0.5 text-[11px] opacity-80">{protocol.goal}</p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function ProtocolsPanel() {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('All levels');
  const [activeId, setActiveId] = useState(PRO_PROTOCOLS[0]?.id ?? '');

  const protocols = useMemo(() => {
    const filtered =
      difficulty === 'All levels'
        ? PRO_PROTOCOLS
        : PRO_PROTOCOLS.filter((item) => item.difficulty === difficulty);

    return [...filtered].sort(
      (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty],
    );
  }, [difficulty]);

  useEffect(() => {
    if (protocols.length === 0) return;
    if (!protocols.some((item) => item.id === activeId)) {
      setActiveId(protocols[0]!.id);
    }
  }, [protocols, activeId]);

  const active =
    protocols.find((item) => item.id === activeId) ?? protocols[0] ?? null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div
        className="-mx-0.5 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0"
        role="tablist"
        aria-label="Filter protocols by difficulty"
      >
        {DIFFICULTY_FILTERS.map((option) => {
          const selected = difficulty === option;
          const count =
            option === 'All levels'
              ? PRO_PROTOCOLS.length
              : PRO_PROTOCOLS.filter((item) => item.difficulty === option)
                  .length;

          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setDifficulty(option)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                selected
                  ? 'bg-accent text-white'
                  : 'bg-surface-secondary text-foreground-secondary hover:text-foreground',
              )}
            >
              {option === 'Beginner-friendly'
                ? 'Beginner'
                : option === 'Advanced research'
                  ? 'Advanced'
                  : option}
              <span
                className={cn(
                  'text-[11px] tabular-nums',
                  selected ? 'text-white/80' : 'text-foreground-secondary',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {protocols.length === 0 || !active ? (
        <p className="text-sm text-foreground-secondary">
          No protocols in this level yet.
        </p>
      ) : (
        <>
          {/* Mobile: open layout, no nested chrome */}
          <div className="space-y-6 lg:hidden">
            <ProtocolPicker
              protocols={protocols}
              selectedId={active.id}
              onSelect={setActiveId}
              variant="mobile"
            />

            <div className="space-y-4 border-t border-border pt-6">
              <div className="space-y-2">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-foreground">
                  {active.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{active.goal}</Badge>
                  <Badge variant="muted">{active.difficulty}</Badge>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground-secondary">
                {active.summary}
              </p>
              <FocusTags protocol={active} />
              <StackDetails protocol={active} />
            </div>
          </div>

          {/* Desktop: nested bordered split that looked good */}
          <div className="hidden min-h-[480px] overflow-hidden rounded-[20px] border border-border bg-surface lg:grid lg:grid-cols-[260px_1fr]">
            <ProtocolPicker
              protocols={protocols}
              selectedId={active.id}
              onSelect={setActiveId}
              variant="desktop"
            />

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                  {active.name}
                </h3>
                <Badge variant="accent">{active.goal}</Badge>
                <Badge variant="muted">{active.difficulty}</Badge>
              </div>
              <p className="mt-2 text-sm text-foreground-secondary">
                {active.summary}
              </p>
              <div className="mt-3">
                <FocusTags protocol={active} />
              </div>
              <div className="mt-5">
                <StackDetails protocol={active} />
              </div>
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-foreground-secondary">
        Stacks are educational research outlines only — not prescriptions or
        personal medical protocols.
      </p>
    </div>
  );
}
