'use client';

import { ExternalLink } from 'lucide-react';
import { useMemo } from 'react';

import { CouponCodeButton } from '@/src/components/affiliates/coupon-code-button';
import { OfferPrice } from '@/src/components/affiliates/offer-price';
import { TrustedSourceBadge } from '@/src/components/affiliates/partner-badges';
import { PartnerLabScore } from '@/src/components/affiliates/partner-lab-score';
import { isPreferredPartner } from '@/src/data/affiliates/preferred-partners';
import {
  formatAffiliateUsd,
  type AffiliateOffer,
} from '@/src/data/affiliates/slots';
import {
  groupOffersByVendor,
  type VendorOfferGroup,
} from '@/src/lib/affiliate-offers';
import { cn } from '@/src/lib/utils';
import { trackAnalyticsEvent } from '@/src/services/firestore/analytics';

function openOffer(
  offer: AffiliateOffer,
  peptideId?: string,
  peptideName?: string,
) {
  void trackAnalyticsEvent({
    name: 'affiliate_click',
    meta: {
      partnerId: offer.vendorId,
      partnerLabel: offer.vendorLabel,
      peptideId: peptideId ?? null,
      peptideName: peptideName ?? null,
      productName: offer.productName ?? null,
      href: offer.href,
      priceUsd: offer.priceUsd,
    },
  });
}

function sizeLabel(offer: AffiliateOffer): string {
  return offer.testAmount || offer.productName || 'Standard';
}

function priceRangeLabel(group: VendorOfferGroup): string {
  const low = formatAffiliateUsd(group.lowestSalePriceUsd);
  if (group.highestSalePriceUsd <= group.lowestSalePriceUsd) return low;
  return `${low} – ${formatAffiliateUsd(group.highestSalePriceUsd)}`;
}

export function PartnerSlotList({
  offers,
  peptideId,
  peptideName,
}: {
  offers: AffiliateOffer[];
  peptideId?: string;
  peptideName?: string;
}) {
  const groups = useMemo(() => groupOffersByVendor(offers), [offers]);

  if (groups.length === 0) {
    return (
      <p className="rounded-[14px] border border-border bg-surface-secondary px-4 py-6 text-center text-sm text-foreground-secondary">
        No partner listings match this compound yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const preferred = isPreferredPartner(
          group.vendorId,
          group.vendorLabel,
        );
        const primary = group.sizes[0];
        return (
          <div
            key={group.vendorId}
            className={cn(
              'flex min-w-0 flex-col gap-2 rounded-[12px] border px-3 py-2.5',
              preferred
                ? 'border-[color-mix(in_srgb,#0d9488_35%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_srgb,#ccfbf1_70%,white),white_70%)]'
                : 'border-border bg-surface-secondary',
            )}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-foreground">
                {group.vendorLabel}
              </p>
              {preferred ? (
                <TrustedSourceBadge className="inline-flex items-center rounded-[6px] bg-teal-700/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-teal-800" />
              ) : null}
              <PartnerLabScore vendorId={group.vendorId} />
            </div>

            {group.couponCode.trim() ? (
              <div className="w-full max-w-full sm:max-w-[11rem]">
                <CouponCodeButton
                  code={group.couponCode}
                  discountLabel={group.discountLabel}
                  partnerId={group.vendorId}
                  partnerLabel={group.vendorLabel}
                  peptideId={peptideId}
                  peptideName={peptideName}
                  className="w-full max-w-full"
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              {group.hasKnownSizes ? (
                group.sizes.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between gap-2 rounded-[10px] border border-border/70 bg-white/70 px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">
                        {sizeLabel(offer)}
                      </p>
                      {offer.productName &&
                      offer.productName !== offer.testAmount ? (
                        <p className="truncate text-[11px] text-foreground-secondary">
                          {offer.productName}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <OfferPrice offer={offer} size="sm" />
                      {offer.href && offer.href !== '#' ? (
                        <a
                          href={offer.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            openOffer(offer, peptideId, peptideName)
                          }
                          className={cn(
                            'inline-flex h-8 items-center gap-1 rounded-[8px] px-3 text-xs font-medium text-white no-underline',
                            preferred ? 'bg-teal-700' : 'bg-accent',
                          )}
                        >
                          View
                          <ExternalLink className="size-3" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : primary ? (
                <div className="flex items-center justify-between gap-2 rounded-[10px] border border-border/70 bg-white/70 px-2.5 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">
                      Price range
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-[family-name:var(--font-display)] text-sm font-semibold tabular-nums text-foreground">
                      {priceRangeLabel(group)}
                    </span>
                    {primary.href && primary.href !== '#' ? (
                      <a
                        href={primary.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          openOffer(primary, peptideId, peptideName)
                        }
                        className={cn(
                          'inline-flex h-8 items-center gap-1 rounded-[8px] px-3 text-xs font-medium text-white no-underline',
                          preferred ? 'bg-teal-700' : 'bg-accent',
                        )}
                      >
                        View
                        <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
