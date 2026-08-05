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

export type AdminDashboardMetrics = {
  generatedAt: string;
  users: {
    total: number;
    pro: number;
    free: number;
    new7d: number;
    new30d: number;
    withStripe: number;
    byStatus: {
      active: number;
      review: number;
      cooldown: number;
      suspended: number;
    };
    chatBlocked: number;
    withAbuseStrikes: number;
  };
  sales: {
    proSubscribers: number;
    estimatedMrrUsd: number;
    checkoutStarted7d: number;
    checkoutCompleted7d: number;
    checkoutCompletedAll: number;
    estimatedRevenueAllUsd: number;
  };
  engagement: {
    messagesToday: number;
    activeChattersToday: number;
    messages7d: number;
    couponCopies7d: number;
    couponCopiesAll: number;
    safetyEvents7d: number;
    safetyEventsAll: number;
  };
  affiliates: {
    clicks7d: number;
    clicksAll: number;
    uniqueClickers7d: number;
    uniqueClickersAll: number;
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
