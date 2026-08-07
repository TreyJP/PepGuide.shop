'use client';

import { useEffect, useState } from 'react';

import { AdminBadge } from '@/src/components/pro/admin-badge';
import { ModalShell } from '@/src/components/ui/modal-shell';
import {
  getRankTier,
  nextRankTier,
  RANK_TIERS,
} from '@/src/constants/ranks';
import { cn } from '@/src/lib/utils';
import { publicProfileRepository } from '@/src/services/firestore/public-profiles';

export type MemberRankTarget = {
  userId: string;
  displayName: string;
  isAdmin?: boolean;
};

export function MemberRankSheet({
  target,
  onClose,
}: {
  target: MemberRankTarget | null;
  onClose: () => void;
}) {
  const [chatCount, setChatCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setLoading(true);
    setChatCount(0);
    setIsAdmin(Boolean(target.isAdmin));

    void (async () => {
      try {
        const profile = await publicProfileRepository.getProfile(target.userId);
        if (cancelled) return;
        setChatCount(profile?.chatCount ?? 0);
        setIsAdmin(Boolean(profile?.isAdmin || target.isAdmin));
      } catch {
        if (!cancelled) {
          setChatCount(0);
          setIsAdmin(Boolean(target.isAdmin));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [target]);

  if (!target) return null;

  const current = getRankTier(chatCount);
  const next = nextRankTier(chatCount);

  return (
    <ModalShell
      open={Boolean(target)}
      onClose={onClose}
      title={target.displayName}
      titleId="member-rank-sheet"
      eyebrow="Member rank"
      description={
        loading
          ? 'Loading activity…'
          : isAdmin
            ? 'PepGuide staff account — admins sit above the member tier list.'
            : `${chatCount} research chat${chatCount === 1 ? '' : 's'} · ${current.name}`
      }
      className="max-w-md"
      footer={
        next && !isAdmin
          ? `${next.minChats - chatCount} more chat${
              next.minChats - chatCount === 1 ? '' : 's'
            } to reach ${next.name}.`
          : 'Ranks update as members create research chats.'
      }
    >
      <ol className="space-y-2">
        {isAdmin ? (
          <li className="rounded-[14px] border border-accent/30 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-accent">PepGuide Admin</p>
              <AdminBadge compact />
            </div>
            <p className="mt-1 text-xs text-foreground-secondary">
              Staff identity — visibly distinct from member ranks.
            </p>
          </li>
        ) : null}

        {[...RANK_TIERS].reverse().map((tier) => {
          const active = !isAdmin && tier.id === current.id;
          const earned = !isAdmin && chatCount >= tier.minChats;
          return (
            <li
              key={tier.id}
              className={cn(
                'rounded-[14px] border px-3 py-3 transition-colors',
                active
                  ? 'border-accent/40 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
                  : earned
                    ? 'border-border bg-surface-secondary/40'
                    : 'border-border/70 bg-surface opacity-55',
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-accent' : 'text-foreground',
                  )}
                >
                  {tier.name}
                  {active ? (
                    <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.12em]">
                      Current
                    </span>
                  ) : null}
                </p>
                <p className="text-xs tabular-nums text-foreground-secondary">
                  {tier.minChats}+ chats
                </p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">
                {tier.blurb}
              </p>
            </li>
          );
        })}
      </ol>
    </ModalShell>
  );
}
