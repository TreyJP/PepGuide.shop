'use client';

import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

import { OfferPrice } from '@/src/components/affiliates/offer-price';
import { PartnerLabScore } from '@/src/components/affiliates/partner-lab-score';
import { isPreferredPartner } from '@/src/data/affiliates/preferred-partners';
import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import { getOfferSalePriceUsd } from '@/src/lib/offer-pricing';
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

export function LibVendorGrid({
  offers,
  peptideId,
  peptideName,
  variant = 'deck',
  previewCount = 2,
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

  if (offers.length === 0) {
    return (
      <p className={`lib-vg__empty lib-vg__empty--${variant}`}>
        No vendor prices yet
      </p>
    );
  }

  const cheapestSale = Math.min(
    ...offers.map((offer) => getOfferSalePriceUsd(offer)),
  );
  const canExpand = offers.length > previewCount;
  const visible = expanded ? offers : offers.slice(0, previewCount);
  const hiddenCount = offers.length - previewCount;

  return (
    <div className={`lib-vg-wrap lib-vg-wrap--${variant}`}>
      <div className={`lib-vg lib-vg--${variant}`}>
        {visible.map((offer) => {
          const preferred = isPreferredPartner(
            offer.vendorId,
            offer.vendorLabel,
          );
          const salePrice = getOfferSalePriceUsd(offer);
          const isCheapest = !preferred && salePrice === cheapestSale;
          const cellClass = [
            'lib-vg__cell',
            preferred ? 'lib-vg__cell--preferred' : null,
            isCheapest ? 'lib-vg__cell--best' : null,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={offer.id}
              className={cellClass}
              data-preferred={preferred ? 'true' : undefined}
              data-cheapest={isCheapest ? 'true' : undefined}
            >
              {preferred ? (
                <span className="lib-vg__preferred-tag">Trusted</span>
              ) : isCheapest ? (
                <span className="lib-vg__best-tag">Lowest</span>
              ) : null}
              <button
                type="button"
                className="lib-vg__open"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openVendor(offer, peptideId, peptideName);
                }}
              >
                <span className="lib-vg__vendor">{offer.vendorLabel}</span>
                {offer.productName || offer.testAmount ? (
                  <span className="lib-vg__sku">
                    {offer.productName || offer.testAmount}
                  </span>
                ) : null}
                <OfferPrice offer={offer} size="sm" className="lib-vg__price" />
                <ExternalLink className="lib-vg__icon" aria-hidden />
              </button>
              <div className="lib-vg__meta">
                <div
                  className="lib-vg__lab"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <PartnerLabScore vendorId={offer.vendorId} />
                </div>
                {offer.couponCode ? (
                  <button
                    type="button"
                    className={
                      preferred ? 'lib-vg__coupon' : 'lib-vg__coupon lib-vg__coupon--muted'
                    }
                    title="Copy coupon code"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void copyCoupon(offer.couponCode).then(() => {
                        setCopiedId(offer.id);
                        window.setTimeout(() => setCopiedId(null), 1400);
                      });
                    }}
                  >
                    {copiedId === offer.id
                      ? 'Copied'
                      : `${offer.couponCode} · ${offer.discountLabel}`}
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
          {expanded ? 'Show less' : `Show more (${hiddenCount})`}
        </button>
      ) : null}
    </div>
  );
}
