import type {
  CampaignPayoutStructure,
  CampaignLeaderboardRow,
  PublicReferralLabel,
  ReferralStatus,
} from '@/src/types/campaigns';

export function toPublicReferralLabel(status: ReferralStatus): PublicReferralLabel {
  if (status === 'qualified') return 'Qualified';
  if (status === 'rejected') return 'Rejected';
  if (status === 'fraud_review') return 'Under Review';
  return 'Pending';
}

export function msRemaining(endDateIso: string, now = Date.now()): number {
  return Math.max(0, new Date(endDateIso).getTime() - now);
}

export function formatCountdown(endDateIso: string, now = Date.now()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
} {
  const total = msRemaining(endDateIso, now);
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  const days = Math.floor(total / (24 * 60 * 60 * 1000));
  const hours = Math.floor((total % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((total % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((total % (60 * 1000)) / 1000);
  return { days, hours, minutes, seconds, ended: false };
}

/** Estimated payout for a given rank (1-based). Not final until campaign is finalized. */
export function estimatePayoutUsd(
  prizePoolUsd: number,
  structure: CampaignPayoutStructure,
  rank: number | null,
  eligibleCount: number,
): number | null {
  if (!rank || rank < 1) return null;

  if (structure.mode === 'ranked') {
    const place = structure.places[String(rank)];
    if (typeof place === 'number') return place;
    const band = structure.sharedBand;
    if (band && rank >= band.from && rank <= band.to) return band.eachUsd;
    return null;
  }

  const placePct = structure.places[String(rank)];
  if (typeof placePct === 'number') {
    return Math.round((prizePoolUsd * placePct) / 100);
  }

  const remaining = structure.remainingSharedPercent ?? 0;
  if (remaining <= 0) return null;

  const placedKeys = Object.keys(structure.places)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const maxPlaced = placedKeys.length ? Math.max(...placedKeys) : 0;
  if (rank <= maxPlaced) return null;

  const sharedSlots = Math.max(0, eligibleCount - maxPlaced);
  if (sharedSlots <= 0) return null;
  return Math.round((prizePoolUsd * remaining) / 100 / sharedSlots);
}

export function assignRanks(
  rows: Array<{ participantId: string; qualifiedReferrals: number }>,
): Map<string, number> {
  const sorted = [...rows].sort((a, b) => {
    if (b.qualifiedReferrals !== a.qualifiedReferrals) {
      return b.qualifiedReferrals - a.qualifiedReferrals;
    }
    return a.participantId.localeCompare(b.participantId);
  });
  const ranks = new Map<string, number>();
  sorted.forEach((row, index) => {
    ranks.set(row.participantId, index + 1);
  });
  return ranks;
}

export function buildLeaderboard(
  participants: Array<{
    id: string;
    userId: string;
    publicName: string;
    qualifiedReferrals: number;
    status: CampaignLeaderboardRow['status'];
  }>,
): CampaignLeaderboardRow[] {
  const active = participants.filter((p) => p.status === 'active');
  const ranks = assignRanks(
    active.map((p) => ({
      participantId: p.id,
      qualifiedReferrals: p.qualifiedReferrals,
    })),
  );
  return active
    .map((p) => ({
      rank: ranks.get(p.id) ?? 0,
      participantId: p.id,
      userId: p.userId,
      publicName: p.publicName,
      qualifiedReferrals: p.qualifiedReferrals,
      status: p.status,
    }))
    .sort((a, b) => a.rank - b.rank);
}

export function buildCampaignReferralUrl(input: {
  origin: string;
  code: string;
  campaignId: string;
  vanityHandle?: string | null;
}): string {
  const url = new URL(input.origin);
  const ref =
    input.vanityHandle && input.vanityHandle.trim()
      ? input.vanityHandle.trim().toLowerCase()
      : input.code;
  url.searchParams.set('ref', ref);
  url.searchParams.set('campaign', input.campaignId);
  return url.toString();
}

/** Short path-style link: https://pepguide.shop/ref/rylan */
export function buildVanityRefPathUrl(input: {
  origin: string;
  vanityHandle: string;
  campaignId?: string | null;
}): string {
  const url = new URL(`/ref/${encodeURIComponent(input.vanityHandle)}`, input.origin);
  if (input.campaignId) {
    url.searchParams.set('campaign', input.campaignId);
  }
  return url.toString();
}
