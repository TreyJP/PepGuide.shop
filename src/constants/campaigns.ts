import type {
  CampaignPayoutStructure,
  CampaignQualificationRules,
} from '@/src/types/campaigns';

export const CAMPAIGN_TERMS_VERSION = '2026.08.20';

export const DEFAULT_QUALIFICATION_RULES: CampaignQualificationRules = {
  emailVerified: true,
  minimumAccountAgeHours: 24,
  minimumSessions: 2,
  minimumMeaningfulActions: 2,
  requireFraudApproval: true,
  maxAutoQualifyFraudScore: 29,
  mediumRiskCeiling: 59,
  highRiskFloor: 60,
  veryHighRiskFloor: 80,
};

export const DEFAULT_PAYOUT_STRUCTURE: CampaignPayoutStructure = {
  mode: 'ranked',
  places: {
    '1': 400,
    '2': 250,
    '3': 150,
    '4': 100,
    '5': 60,
  },
  sharedBand: { from: 6, to: 10, eachUsd: 8 },
};

export const DEFAULT_CAMPAIGN_RULES_MARKDOWN = `## Campaign rules

- Only **qualified** referrals count toward the leaderboard and cash rewards.
- Self-referrals are prohibited.
- Bots, purchased accounts, farmed accounts, and automated signups are prohibited.
- Duplicate or fake accounts are prohibited.
- PepGuide may review suspicious activity and remove fraudulent referrals.
- Participants may be disqualified for manipulation.
- Leaderboard positions are **provisional** until final review after the campaign ends.
- Prize payouts occur only after campaign verification and finalization.
- PepGuide may update anti-fraud checks without publishing exact thresholds.

## Eligibility

- You must have a PepGuide account.
- You must accept these campaign rules to join.
- One campaign referral code and creator handle per participant — these cannot be chosen freely after joining or changed later.

## Payouts

- Estimated payouts shown during the campaign are not final.
- Official winners and amounts are published only after **Finalize Campaign**.
- Contact PepGuide support for disputes after finalization.
`;

/** Structured rules for the campaign detail UI (markdown kept for storage/admin). */
export const CAMPAIGN_RULE_SECTIONS = [
  {
    title: 'How referrals qualify',
    items: [
      'Only qualified referrals count toward the leaderboard and cash rewards.',
      'Accounts must verify email, stay active, and complete meaningful PepGuide activity.',
      'Leaderboard positions stay provisional until final review.',
    ],
  },
  {
    title: 'What is prohibited',
    items: [
      'Self-referrals and duplicate accounts.',
      'Bots, automated signups, purchased or farmed accounts.',
      'Fake identities or any attempt to manipulate rankings.',
    ],
  },
  {
    title: 'Eligibility',
    items: [
      'You must have a PepGuide account and accept these rules to join.',
      'Each participant gets one referral code and one creator handle — neither can be changed later.',
    ],
  },
  {
    title: 'Payouts & disputes',
    items: [
      'Estimated payouts shown during the campaign are not final.',
      'Official winners are published only after PepGuide finalizes results.',
      'Fraudulent referrals may be removed; participants may be disqualified for manipulation.',
      'Contact PepGuide support for disputes after finalization.',
    ],
  },
] as const;

export const DEFAULT_ATTRIBUTION_WINDOW_DAYS = 30;

/** Cookie / local attribution key for campaign referral codes. */
export const CAMPAIGN_REF_COOKIE = 'pepguide_campaign_ref';
export const CAMPAIGN_ID_COOKIE = 'pepguide_campaign_id';
export const CAMPAIGN_VISITOR_COOKIE = 'pepguide_visitor_id';
