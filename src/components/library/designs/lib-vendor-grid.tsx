'use client';

import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';

import { OfferPrice } from '@/src/components/affiliates/offer-price';
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
import { trackAnalyticsEvent } from '@/src/services/firestore/analytics';

function openVendor(
  offer: AffiliateOffer,
  peptideId: string,
  peptideName: string,
) {
  void trackAnalyticsEvent({
    name: 'affiliate_click',
    meta: {
      partnerId: offer.vendorId,
      partnerLabel: offer.vendorLabel,
      peptideId,
      peptideName,
      productName: offer.productName ?? null,
      href: offer.href,
      priceUsd: offer.priceUsd,
    },
  });
  if (offer.href && offer.href !== '#') {
    window.open(offer.href, '_blank', 'noopener,noreferrer');
  }
}

async function copyCoupon(code: string) {
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const input = document.createElement('input');
    input.value = code;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
}

function priceRangeLabel(group: VendorOfferGroup): string {
  const low = formatAffiliateUsd(group.lowestSalePriceUsd);
  if (group.highestSalePriceUsd <= group.lowestSalePriceUsd) return low;
  return `${low} – ${formatAffiliateUsd(group.highestSalePriceUsd)}`;
}

export function LibVendorGrid({
  offers,
  peptideId,
  peptideName,
  variant = 'deck',
  previewCount = 1,
}: {
  offers: AffiliateOffer[];
  peptideId: string;
  peptideName: string;
  variant?: 'deck' | 'market' | 'stack' | 'tile' | 'ledger';
  /** How many vendors to show before “Show more”. */
  previewCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const groups = useMemo(() => groupOffersByVendor(offers), [offers]);

  if (groups.length === 0) {
    return (
      <p className={`lib-vg__empty lib-vg__empty--${variant}`}>
        No vendor prices yet
      </p>
    );
  }

  const cheapestSale = Math.min(
    ...groups.map((group) => group.lowestSalePriceUsd),
  );
  const canExpand = groups.length > previewCount;
  const visible = expanded ? groups : groups.slice(0, previewCount);
  const hiddenCount = groups.length - previewCount;

  return (
    <div className={`lib-vg-wrap lib-vg-wrap--${variant}`}>
      <div className={`lib-vg lib-vg--${variant}`}>
        {visible.map((group) => {
          const preferred = isPreferredPartner(
            group.vendorId,
            group.vendorLabel,
          );
          const isCheapest =
            !preferred && group.lowestSalePriceUsd === cheapestSale;
          const cellClass = [
            'lib-vg__cell',
            preferred ? 'lib-vg__cell--preferred' : null,
            isCheapest ? 'lib-vg__cell--best' : null,
          ]
            .filter(Boolean)
            .join(' ');
          const primary = group.sizes[0];

          return (
            <div
              key={group.vendorId}
              className={cellClass}
              data-preferred={preferred ? 'true' : undefined}
              data-cheapest={isCheapest ? 'true' : undefined}
            >
              {preferred ? (
                <span className="lib-vg__preferred-tag">Trusted</span>
              ) : isCheapest ? (
                <span className="lib-vg__best-tag">Lowest</span>
              ) : null}

              <div className="lib-vg__vendor-head">
                <span className="lib-vg__vendor">{group.vendorLabel}</span>
                <div className="lib-vg__meta">
                  <div
                    className="lib-vg__lab"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <PartnerLabScore vendorId={group.vendorId} />
                  </div>
                  {group.couponCode ? (
                    <button
                      type="button"
                      className={
                        preferred
                          ? 'lib-vg__coupon'
                          : 'lib-vg__coupon lib-vg__coupon--muted'
                      }
                      title="Copy coupon code"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void copyCoupon(group.couponCode).then(() => {
                          setCopiedId(group.vendorId);
                          window.setTimeout(() => setCopiedId(null), 1400);
                        });
                      }}
                    >
                      {copiedId === group.vendorId
                        ? 'Copied'
                        : `${group.couponCode} · ${group.discountLabel}`}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="lib-vg__sizes">
                {group.hasKnownSizes ? (
                  group.sizes.map((offer) => (
                    <button
                      key={offer.id}
                      type="button"
                      className="lib-vg__size-row lib-vg__size-row--price-only"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openVendor(offer, peptideId, peptideName);
                      }}
                    >
                      <OfferPrice
                        offer={offer}
                        size="sm"
                        className="lib-vg__price"
                      />
                      <ExternalLink className="lib-vg__icon" aria-hidden />
                    </button>
                  ))
                ) : primary ? (
                  <button
                    type="button"
                    className="lib-vg__size-row lib-vg__size-row--price-only"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      openVendor(primary, peptideId, peptideName);
                    }}
                  >
                    <span className="lib-vg__price font-[family-name:var(--font-display)] font-semibold tabular-nums text-foreground text-sm">
                      {priceRangeLabel(group)}
                    </span>
                    <ExternalLink className="lib-vg__icon" aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {canExpand ? (
        <button
          type="button"
          className="lib-vg__toggle"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
        >
          {expanded
            ? 'Show less'
            : hiddenCount === 1
              ? 'Show more (1)'
              : `Show more (${hiddenCount})`}
        </button>
      ) : null}
    </div>
  );
}
