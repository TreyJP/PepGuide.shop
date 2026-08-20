export type CampaignDirectoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  prizePoolUsd: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  qualifiedReferralCount: number;
  payoutStructure: unknown;
};

export function formatCampaignMoney(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

export function formatCampaignDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function payoutSummary(structure: unknown): string {
  if (!structure || typeof structure !== 'object') return 'See campaign page';
  const s = structure as {
    mode?: string;
    places?: Record<string, number>;
  };
  if (s.mode === 'ranked' && s.places?.['1']) {
    return `1st ${formatCampaignMoney(s.places['1'])}`;
  }
  if (s.mode === 'percentage' && s.places?.['1']) {
    return `1st ${s.places['1']}% of pool`;
  }
  return 'Ranked payouts';
}
