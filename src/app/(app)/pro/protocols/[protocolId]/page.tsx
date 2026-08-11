'use client';

import Link from 'next/link';
import { use, useState } from 'react';

import { AddProtocolToCycleModal } from '@/src/components/cycle/add-protocol-to-cycle-modal';
import { BookmarkToggleButton } from '@/src/components/pro/bookmark-toggle-button';
import { ProtocolPeptideLibrary } from '@/src/components/pro/protocol-peptide-library';
import { ProLockedPreview } from '@/src/components/pro/pro-locked-preview';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { PRO_COMING_SOON } from '@/src/constants/billing';
import { getProtocol } from '@/src/data/pro/protocols';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useProAccess } from '@/src/hooks/use-pro-access';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

function ProtocolShopContent({ protocolId }: { protocolId: string }) {
  const protocol = getProtocol(protocolId);
  const user = useAuthStore((state) => state.user);
  const { isPro } = useProAccess();
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );
  const [cycleOpen, setCycleOpen] = useState(false);
  const [cycleNotice, setCycleNotice] = useState<string | null>(null);

  if (!protocol) {
    return (
      <EmptyState
        title="Protocol not found"
        description="This stack may have been removed or the bookmark link is outdated."
        action={
          <Link href="/pro/protocols">
            <Button variant="secondary">Back to Protocols</Button>
          </Link>
        }
      />
    );
  }

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
    <div className="space-y-5">
      <Link
        href="/pro/bookmarks"
        className="inline-flex text-sm text-foreground-secondary hover:text-foreground"
      >
        ← Back to Bookmarks
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            {protocol.name}
          </h1>
          <Badge variant="accent">{protocol.goal}</Badge>
          <Badge variant="muted">{protocol.difficulty}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-foreground-secondary">
          {protocol.summary}
        </p>
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
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <BookmarkToggleButton
            input={{
              kind: 'protocol',
              protocolId: protocol.id,
              title: protocol.name,
              subtitle: protocol.goal,
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleAddToCycle}
          >
            Add stack to cycle
          </Button>
          <Link href="/pro/protocols">
            <Button type="button" size="sm" variant="ghost">
              All protocols
            </Button>
          </Link>
        </div>
        {cycleNotice ? (
          <p className="text-sm text-accent">{cycleNotice}</p>
        ) : null}
      </div>

      <ProtocolPeptideLibrary protocol={protocol} showVendors />

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

      <AddProtocolToCycleModal
        open={cycleOpen}
        protocol={protocol}
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

export default function ProtocolShopPage({
  params,
}: {
  params: Promise<{ protocolId: string }>;
}) {
  const { protocolId } = use(params);
  const { loading, isPro } = useProAccess();
  const { isAdmin, loading: adminLoading } = useAdminAccess();
  const waiting = loading || adminLoading;
  const unlocked = isAdmin || (isPro && !PRO_COMING_SOON);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-3.5 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground sm:text-2xl">
          Protocol shopping
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Vendor prices for compounds in your bookmarked stack.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 pb-8 sm:p-6">
        <div className="mx-auto w-full max-w-2xl sm:max-w-3xl">
          {waiting ? (
            <p className="text-sm text-foreground-secondary">Loading…</p>
          ) : unlocked ? (
            <ProtocolShopContent protocolId={protocolId} />
          ) : (
            <ProLockedPreview feature="Protocols">
              <ProtocolShopContent protocolId={protocolId} />
            </ProLockedPreview>
          )}
        </div>
      </div>
    </div>
  );
}
