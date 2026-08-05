'use client';

import { ExternalLink } from 'lucide-react';

import { CouponCodeButton } from '@/src/components/affiliates/coupon-code-button';
import { PartnerLabScore } from '@/src/components/affiliates/partner-lab-score';
import {
  formatAffiliateUsd,
  type AffiliateOffer,
} from '@/src/data/affiliates/slots';
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
  if (offer.href && offer.href !== '#') {
    window.open(offer.href, '_blank', 'noopener,noreferrer');
  }
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
  if (offers.length === 0) {
    return (
      <p className="rounded-[14px] border border-border bg-surface-secondary px-4 py-6 text-center text-sm text-foreground-secondary">
        No SomaChems listings match this compound yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="flex min-w-0 flex-col gap-2 rounded-[12px] border border-border bg-surface-secondary px-3 py-2.5 sm:flex-row sm:items-center sm:gap-2"
        >
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-foreground">
                {offer.vendorLabel}
              </p>
              <PartnerLabScore vendorId={offer.vendorId} />
            </div>
            {offer.productName ? (
              <p className="mt-0.5 truncate text-xs text-foreground-secondary">
                {offer.productName}
              </p>
            ) : null}
            <div className="mt-1.5 w-full max-w-full sm:max-w-[11rem]">
              <CouponCodeButton
                code={offer.couponCode}
                discountLabel={offer.discountLabel}
                partnerId={offer.vendorId}
                partnerLabel={offer.vendorLabel}
                peptideId={peptideId}
                peptideName={peptideName}
                className="w-full max-w-full"
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tabular-nums text-foreground">
              {formatAffiliateUsd(offer.priceUsd)}
            </p>
            <button
              type="button"
              onClick={() => openOffer(offer, peptideId, peptideName)}
              className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-accent px-3 text-xs font-medium text-white"
            >
              View
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
