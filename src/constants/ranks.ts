export type RankTier = {
  id: string;
  name: string;
  minChats: number;
  blurb: string;
};

/** Chat-activity tiers shown when tapping a member name. */
export const RANK_TIERS: RankTier[] = [
  {
    id: 'spark',
    name: 'Spark',
    minChats: 0,
    blurb: 'Just getting started with research chats.',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    minChats: 5,
    blurb: 'Building a habit of asking better questions.',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    minChats: 15,
    blurb: 'Comfortable comparing ideas across topics.',
  },
  {
    id: 'scholar',
    name: 'Scholar',
    minChats: 30,
    blurb: 'Deep, consistent research activity.',
  },
  {
    id: 'authority',
    name: 'Authority',
    minChats: 50,
    blurb: 'High-volume researcher in the community.',
  },
  {
    id: 'architect',
    name: 'Architect',
    minChats: 100,
    blurb: 'Top-tier chat activity across PepGuide.',
  },
];

export function getRankTier(chatCount: number): RankTier {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (chatCount >= tier.minChats) current = tier;
  }
  return current;
}

export function nextRankTier(chatCount: number): RankTier | null {
  const current = getRankTier(chatCount);
  const index = RANK_TIERS.findIndex((tier) => tier.id === current.id);
  return RANK_TIERS[index + 1] ?? null;
}
