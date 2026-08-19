import type {
  AdminDashboardMetrics,
  AdminDashboardRawData,
  AdminMetricsRange,
  AnalyticsEvent,
} from '@/src/types/analytics';

function rangeSinceIso(range: AdminMetricsRange): string | null {
  if (range === 'all') return null;
  const days = range === '1d' ? 1 : range === '7d' ? 7 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function rangeSinceDay(range: AdminMetricsRange): string | null {
  const iso = rangeSinceIso(range);
  return iso ? iso.slice(0, 10) : null;
}

function isWithin(iso: string | undefined, sinceIso: string): boolean {
  return Boolean(iso && iso >= sinceIso);
}

function inRange(
  iso: string | undefined,
  range: AdminMetricsRange,
): boolean {
  const since = rangeSinceIso(range);
  if (!since) return true;
  return isWithin(iso, since);
}

function uniquePeople(list: AnalyticsEvent[]): number {
  return new Set(
    list
      .map((event) => event.userId || event.email)
      .filter((value): value is string => Boolean(value)),
  ).size;
}

export function buildAdminDashboardMetrics(
  input: AdminDashboardRawData,
  range: AdminMetricsRange,
): AdminDashboardMetrics {
  const sinceDay = rangeSinceDay(range);

  const byStatus = {
    active: 0,
    review: 0,
    cooldown: 0,
    suspended: 0,
  };

  let newInRange = 0;
  let chatBlocked = 0;
  let withAbuseStrikes = 0;

  for (const user of input.users) {
    if (inRange(user.createdAt, range)) newInRange += 1;

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

  const affiliateClicks = input.events.filter(
    (event) =>
      event.name === 'affiliate_click' && inRange(event.createdAt, range),
  );
  const couponCopies = input.events.filter(
    (event) =>
      event.name === 'coupon_copy' && inRange(event.createdAt, range),
  );
  const safetyEvents = input.safetyEvents.filter((event) =>
    inRange(event.createdAt, range),
  );

  const partnerLabel = new Map(
    input.partners.map((partner) => [
      partner.id,
      partner.label?.trim() || partner.id,
    ]),
  );

  const clicksByPartnerMap = new Map<string, number>();
  for (const click of affiliateClicks) {
    const partnerId = String(click.meta.partnerId ?? 'unknown');
    clicksByPartnerMap.set(
      partnerId,
      (clicksByPartnerMap.get(partnerId) ?? 0) + 1,
    );
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

  let messages = 0;
  let activeChatters = 0;
  for (const period of input.usagePeriods) {
    const used = Number(period.messagesUsed ?? 0);
    if (used <= 0) continue;
    const periodDay = period.id || period.updatedAt?.slice(0, 10);
    if (!periodDay) continue;
    if (sinceDay && periodDay < sinceDay) continue;
    messages += used;
    activeChatters += 1;
  }

  return {
    generatedAt: input.generatedAt,
    range,
    users: {
      total: input.users.length,
      newInRange,
      byStatus,
      chatBlocked,
      withAbuseStrikes,
    },
    engagement: {
      messages,
      activeChatters,
      couponCopies: couponCopies.length,
      safetyEvents: safetyEvents.length,
    },
    affiliates: {
      clicks: affiliateClicks.length,
      uniqueClickers: uniquePeople(affiliateClicks),
      activePartners: input.partners.filter((partner) => partner.active).length,
      totalPartners: input.partners.length,
      clicksByPartner,
      recentClicks,
    },
  };
}
