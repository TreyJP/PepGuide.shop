'use client';

import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AddProtocolToCycleModal } from '@/src/components/cycle/add-protocol-to-cycle-modal';
import { BookmarkToggleButton } from '@/src/components/pro/bookmark-toggle-button';
import { ProtocolPeptideLibrary } from '@/src/components/pro/protocol-peptide-library';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { PRO_PROTOCOLS, type ProProtocol } from '@/src/data/pro/protocols';
import { useProAccess } from '@/src/hooks/use-pro-access';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

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

function ProtocolActions({
  protocol,
  onAddToCycle,
}: {
  protocol: ProProtocol;
  onAddToCycle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <BookmarkToggleButton
        input={{
          kind: 'protocol',
          protocolId: protocol.id,
          title: protocol.name,
          subtitle: protocol.goal,
        }}
      />
      <Button type="button" size="sm" variant="secondary" onClick={onAddToCycle}>
        <RefreshCw className="size-3.5" />
        Add stack to cycle
      </Button>
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
    <aside className="border-b border-border lg:border-b-0 lg:border-r lg:min-h-0 lg:overflow-y-auto">
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

function ProtocolDetail({
  protocol,
  onAddToCycle,
  cycleNotice,
}: {
  protocol: ProProtocol;
  onAddToCycle: () => void;
  cycleNotice: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-foreground sm:text-2xl">
            {protocol.name}
          </h3>
          <Badge variant="accent">{protocol.goal}</Badge>
          <Badge variant="muted">{protocol.difficulty}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-foreground-secondary">
          {protocol.summary}
        </p>
        <FocusTags protocol={protocol} />
        <ProtocolActions protocol={protocol} onAddToCycle={onAddToCycle} />
        {cycleNotice ? (
          <p className="text-sm text-accent">{cycleNotice}</p>
        ) : null}
      </div>

      <ProtocolPeptideLibrary protocol={protocol} />

      <ul className="space-y-1.5">
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

export function ProtocolsPanel() {
  const user = useAuthStore((state) => state.user);
  const { isPro } = useProAccess();
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('All levels');
  const [activeId, setActiveId] = useState(PRO_PROTOCOLS[0]?.id ?? '');
  const [cycleOpen, setCycleOpen] = useState(false);
  const [cycleNotice, setCycleNotice] = useState<string | null>(null);

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

  function handleAddToCycle() {
    if (!user) {
      openSignInModal('Sign in to add protocol stacks to your cycle log.');
      return;
    }
    if (!isPro) {
      openProSubscribeModal('Protocols');
      return;
    }
    setCycleNotice(null);
    setCycleOpen(true);
  }

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
          <div className="space-y-6 lg:hidden">
            <ProtocolPicker
              protocols={protocols}
              selectedId={active.id}
              onSelect={setActiveId}
              variant="mobile"
            />
            <div className="border-t border-border pt-6">
              <ProtocolDetail
                protocol={active}
                onAddToCycle={handleAddToCycle}
                cycleNotice={cycleNotice}
              />
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-[20px] border border-border bg-surface lg:grid lg:grid-cols-[240px_1fr] lg:min-h-[560px]">
            <ProtocolPicker
              protocols={protocols}
              selectedId={active.id}
              onSelect={setActiveId}
              variant="desktop"
            />
            <div className="min-h-0 overflow-y-auto p-6">
              <ProtocolDetail
                protocol={active}
                onAddToCycle={handleAddToCycle}
                cycleNotice={cycleNotice}
              />
            </div>
          </div>
        </>
      )}

      <p className="text-xs text-foreground-secondary">
        Stacks are educational research outlines only — not prescriptions or
        personal medical protocols. Vendor links are research shopping
        references.
      </p>

      <AddProtocolToCycleModal
        open={cycleOpen}
        protocol={active}
        onClose={() => setCycleOpen(false)}
        onAdded={(count) => {
          setCycleNotice(
            count === 1
              ? 'Added 1 peptide to your cycle log.'
              : `Added ${count} peptides to your cycle log.`,
          );
        }}
      />
    </div>
  );
}
