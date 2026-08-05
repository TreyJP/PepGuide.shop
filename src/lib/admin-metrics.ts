import { PRO_BILLING } from '@/src/constants/billing';
import type { AdminDashboardMetrics, AnalyticsEvent } from '@/src/types/analytics';

type UserRow = {
  createdAt?: string;
  subscriptionTier?: string;
  accountStatus?: string;
  chatBlockedUntil?: string | null;
  abuseStrikeCount?: number;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
};

type UsageRow = {
  id?: string;
  messagesUsed?: number;
  updatedAt?: string;
};

type SafetyRow = {
  createdAt?: string;
};

type PartnerRow = {
  id: string;
  label?: string;
  active?: boolean;
};

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function todayPeriodId(): string {
  return new Date().toISOString().slice(0, 10);
}

function isWithin(iso: string | undefined, sinceIso: string): boolean {
  return Boolean(iso && iso >= sinceIso);
}

export function buildAdminDashboardMetrics(input: {
  users: UserRow[];
  events: AnalyticsEvent[];
  usagePeriods: UsageRow[];
  safetyEvents: SafetyRow[];
  partners: PartnerRow[];
}): AdminDashboardMetrics {
  const now = new Date().toISOString();
  const since7d = daysAgoIso(7);
  const since30d = daysAgoIso(30);
  const today = todayPeriodId();

  const byStatus = {
    active: 0,
    review: 0,
    cooldown: 0,
    suspended: 0,
  };

  let pro = 0;
  let free = 0;
  let new7d = 0;
  let new30d = 0;
  let withStripe = 0;
  let chatBlocked = 0;
  let withAbuseStrikes = 0;

  for (const user of input.users) {
    if (user.subscriptionTier === 'pro') pro += 1;
    else free += 1;

    if (isWithin(user.createdAt, since7d)) new7d += 1;
    if (isWithin(user.createdAt, since30d)) new30d += 1;

    if (user.stripeSubscriptionId || user.stripeCustomerId) withStripe += 1;

    const status = (user.accountStatus ?? 'active') as keyof typeof byStatus;
    if (status in byStatus) byStatus[status] += 1;
    else byStatus.active += 1;

    if (
      user.chatBlockedUntil &&
      new Date(user.chatBlockedUntil).getTime() > Date.now()
    ) {
      chatBlocked += 1;
    }
    if ((user.abuseStrikeCount ?? 0) > 0) withAbuseStrikes += 1;
  }

  const affiliateClicks = input.events.filter((e) => e.name === 'affiliate_click');
  const couponCopies = input.events.filter((e) => e.name === 'coupon_copy');
  const checkoutStarted = input.events.filter((e) => e.name === 'checkout_started');
  const checkoutCompleted = input.events.filter(
    (e) => e.name === 'checkout_completed',
  );

  const clicks7d = affiliateClicks.filter((e) => isWithin(e.createdAt, since7d));
  const unique = (list: AnalyticsEvent[]) =>
    new Set(
      list
        .map((e) => e.userId || e.email)
        .filter((value): value is string => Boolean(value)),
    ).size;

  const partnerLabel = new Map(
    input.partners.map((p) => [p.id, p.label?.trim() || p.id]),
  );

  const clicksByPartnerMap = new Map<string, number>();
  for (const click of affiliateClicks) {
    const partnerId = String(click.meta.partnerId ?? 'unknown');
    clicksByPartnerMap.set(partnerId, (clicksByPartnerMap.get(partnerId) ?? 0) + 1);
  }

  const clicksByPartner = [...clicksByPartnerMap.entries()]
    .map(([partnerId, clicks]) => ({
      partnerId,
      label: partnerLabel.get(partnerId) ?? partnerId,
      clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 12);

  const recentClicks = [...affiliateClicks]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50)
    .map((event) => ({
      id: event.id,
      createdAt: event.createdAt,
      email: event.email,
      userId: event.userId,
      partnerId:
        typeof event.meta.partnerId === 'string' ? event.meta.partnerId : null,
      partnerLabel:
        typeof event.meta.partnerLabel === 'string'
          ? event.meta.partnerLabel
          : partnerLabel.get(String(event.meta.partnerId ?? '')) ?? null,
      peptideId:
        typeof event.meta.peptideId === 'string' ? event.meta.peptideId : null,
      peptideName:
        typeof event.meta.peptideName === 'string'
          ? event.meta.peptideName
          : null,
      href: typeof event.meta.href === 'string' ? event.meta.href : null,
    }));

  let messagesToday = 0;
  let activeChattersToday = 0;
  let messages7d = 0;
  for (const period of input.usagePeriods) {
    const used = Number(period.messagesUsed ?? 0);
    if (used <= 0) continue;
    // period docs are keyed YYYY-MM-DD; updatedAt is a good fallback.
    const periodDay = period.id || period.updatedAt?.slice(0, 10);
    if (periodDay === today) {
      messagesToday += used;
      activeChattersToday += 1;
    }
    if (periodDay && periodDay >= since7d.slice(0, 10)) {
      messages7d += used;
    }
  }

  const safety7d = input.safetyEvents.filter((e) =>
    isWithin(e.createdAt, since7d),
  ).length;

  return {
    generatedAt: now,
    users: {
      total: input.users.length,
      pro,
      free,
      new7d,
      new30d,
      withStripe,
      byStatus,
      chatBlocked,
      withAbuseStrikes,
    },
    sales: {
      proSubscribers: pro,
      estimatedMrrUsd: pro * PRO_BILLING.priceUsd,
      checkoutStarted7d: checkoutStarted.filter((e) =>
        isWithin(e.createdAt, since7d),
      ).length,
      checkoutCompleted7d: checkoutCompleted.filter((e) =>
        isWithin(e.createdAt, since7d),
      ).length,
      checkoutCompletedAll: checkoutCompleted.length,
      estimatedRevenueAllUsd: checkoutCompleted.length * PRO_BILLING.priceUsd,
    },
    engagement: {
      messagesToday,
      activeChattersToday,
      messages7d,
      couponCopies7d: couponCopies.filter((e) => isWithin(e.createdAt, since7d))
        .length,
      couponCopiesAll: couponCopies.length,
      safetyEvents7d: safety7d,
      safetyEventsAll: input.safetyEvents.length,
    },
    affiliates: {
      clicks7d: clicks7d.length,
      clicksAll: affiliateClicks.length,
      uniqueClickers7d: unique(clicks7d),
      uniqueClickersAll: unique(affiliateClicks),
      activePartners: input.partners.filter((p) => p.active).length,
      totalPartners: input.partners.length,
      clicksByPartner,
      recentClicks,
    },
  };
}
