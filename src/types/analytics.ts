export type AnalyticsEventName =
  | 'affiliate_click'
  | 'coupon_copy'
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_canceled'
  | 'pro_content_view';

export type AnalyticsEvent = {
  id: string;
  name: AnalyticsEventName;
  createdAt: string;
  userId: string | null;
  email: string | null;
  path: string | null;
  meta: Record<string, string | number | boolean | null>;
};

export type AdminMetricsRange = '1d' | '7d' | '30d' | 'all';

export type AdminDashboardMetrics = {
  generatedAt: string;
  range: AdminMetricsRange;
  users: {
    total: number;
    newInRange: number;
    byStatus: {
      active: number;
      review: number;
      cooldown: number;
      suspended: number;
    };
    chatBlocked: number;
    withAbuseStrikes: number;
  };
  engagement: {
    messages: number;
    activeChatters: number;
    couponCopies: number;
    safetyEvents: number;
  };
  affiliates: {
    clicks: number;
    uniqueClickers: number;
    activePartners: number;
    totalPartners: number;
    clicksByPartner: Array<{ partnerId: string; label: string; clicks: number }>;
    recentClicks: Array<{
      id: string;
      createdAt: string;
      email: string | null;
      userId: string | null;
      partnerId: string | null;
      partnerLabel: string | null;
      peptideId: string | null;
      peptideName: string | null;
      href: string | null;
    }>;
  };
};

export type AdminDashboardRawData = {
  generatedAt: string;
  users: Array<{
    email?: string;
    createdAt?: string;
    accountStatus?: string;
    chatBlockedUntil?: string | null;
    abuseStrikeCount?: number;
  }>;
  events: AnalyticsEvent[];
  usagePeriods: Array<{
    id?: string;
    messagesUsed?: number;
    updatedAt?: string;
  }>;
  safetyEvents: Array<{ createdAt?: string }>;
  partners: Array<{ id: string; label?: string; active?: boolean }>;
};
