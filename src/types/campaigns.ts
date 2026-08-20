/** PepGuide public marketing / clipping campaigns. */

export type CampaignStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'ending_review'
  | 'finalized';

export type CampaignParticipantStatus =
  | 'active'
  | 'removed'
  | 'banned'
  | 'disqualified';

export type ReferralStatus =
  | 'clicked'
  | 'registered'
  | 'email_verified'
  | 'pending'
  | 'qualified'
  | 'rejected'
  | 'fraud_review';

export type PayoutMode = 'ranked' | 'percentage';

export type RankedPayoutTier = {
  mode: 'ranked';
  /** Absolute USD amounts by place. Key is place number as string ("1", "2"). */
  places: Record<string, number>;
  /** Optional shared prize for places in [from, to] inclusive. */
  sharedBand?: { from: number; to: number; eachUsd: number };
};

export type PercentagePayoutTier = {
  mode: 'percentage';
  /** Percent of pool by place. Remaining % may be shared among eligible. */
  places: Record<string, number>;
  remainingSharedPercent?: number;
};

export type CampaignPayoutStructure = RankedPayoutTier | PercentagePayoutTier;

export type CampaignQualificationRules = {
  emailVerified: boolean;
  minimumAccountAgeHours: number;
  minimumSessions: number;
  minimumMeaningfulActions: number;
  requireFraudApproval: boolean;
  /** Auto-qualify only when fraud score is below this (0-100). */
  maxAutoQualifyFraudScore: number;
  /** Medium-risk upper bound — stay pending longer. */
  mediumRiskCeiling: number;
  /** High-risk lower bound — force fraud_review. */
  highRiskFloor: number;
  /** Very high risk floor — reject unless admin approves. */
  veryHighRiskFloor: number;
};

export type Campaign = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  status: CampaignStatus;
  prizePoolUsd: number;
  payoutStructure: CampaignPayoutStructure;
  startDate: string;
  endDate: string;
  attributionWindowDays: number;
  qualificationRules: CampaignQualificationRules;
  termsVersion: string;
  termsMarkdown: string;
  rulesMarkdown: string;
  maxParticipants: number | null;
  leaderboardPublic: boolean;
  /** Aggregates (server-maintained). */
  participantCount: number;
  qualifiedReferralCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
};

export type CampaignInput = {
  name: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  status?: CampaignStatus;
  prizePoolUsd: number;
  payoutStructure: CampaignPayoutStructure;
  startDate: string;
  endDate: string;
  attributionWindowDays?: number;
  qualificationRules?: Partial<CampaignQualificationRules>;
  termsVersion?: string;
  termsMarkdown?: string;
  rulesMarkdown?: string;
  maxParticipants?: number | null;
  leaderboardPublic?: boolean;
};

export type CampaignParticipant = {
  id: string;
  campaignId: string;
  userId: string;
  displayName: string;
  /** Public leaderboard name. */
  publicName: string;
  /**
   * Memorable creator handle for links like ?ref=rylan or /ref/rylan.
   * Lowercase, unique among active participants.
   */
  vanityHandle: string;
  referralCode: string;
  joinedAt: string;
  termsVersionAccepted: string;
  termsAcceptedAt: string;
  status: CampaignParticipantStatus;
  clicks: number;
  registrations: number;
  verifiedSignups: number;
  pendingReferrals: number;
  qualifiedReferrals: number;
  rejectedReferrals: number;
  fraudReviewCount: number;
  rank: number | null;
  estimatedPayoutUsd: number | null;
  updatedAt: string;
};

export type CampaignReferralVisit = {
  id: string;
  campaignId: string;
  participantId: string;
  referralCode: string;
  visitorId: string;
  createdAt: string;
  landingPage: string | null;
  hashedNetworkId: string | null;
  deviceHash: string | null;
  userAgent: string | null;
  country: string | null;
  utm: Record<string, string>;
  signupUserId: string | null;
};

export type CampaignReferral = {
  id: string;
  campaignId: string;
  participantId: string;
  referralCode: string;
  referredUserId: string;
  originalVisitId: string | null;
  status: ReferralStatus;
  fraudRiskScore: number;
  /** Internal only — never shown to participants. */
  fraudSignals: string[];
  registeredAt: string;
  verifiedAt: string | null;
  qualifiedAt: string | null;
  rejectedAt: string | null;
  pendingUntil: string | null;
  updatedAt: string;
};

export type CampaignAuditLog = {
  id: string;
  campaignId: string;
  adminUserId: string;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
};

export type CampaignLeaderboardRow = {
  rank: number;
  participantId: string;
  userId: string;
  publicName: string;
  qualifiedReferrals: number;
  status: CampaignParticipantStatus;
};

export type ParticipantDashboardStats = {
  clicks: number;
  registrations: number;
  verifiedSignups: number;
  pendingReferrals: number;
  qualifiedReferrals: number;
  rejectedReferrals: number;
  fraudReviewCount: number;
  conversionRate: number;
  rank: number | null;
  estimatedPayoutUsd: number | null;
  referralCode: string;
  referralUrl: string;
};

/** Public-safe referral status labels for participants. */
export type PublicReferralLabel =
  | 'Pending'
  | 'Qualified'
  | 'Under Review'
  | 'Rejected';
