'use client';

import { Copy, ExternalLink, Link2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { OfferPrice } from '@/src/components/affiliates/offer-price';
import {
  LowestPriceBadge,
  TrustedSourceBadge,
} from '@/src/components/affiliates/partner-badges';
import { PartnerLabScore } from '@/src/components/affiliates/partner-lab-score';
import { isPreferredPartner } from '@/src/data/affiliates/preferred-partners';
import {
  formatAffiliateUsd,
  type AffiliateOffer,
} from '@/src/data/affiliates/slots';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import {
  groupOffersByVendor,
  type VendorOfferGroup,
} from '@/src/lib/affiliate-offers';
import { trackAnalyticsEvent } from '@/src/services/firestore/analytics';

function sizeLabel(offer: AffiliateOffer): string {
  return offer.testAmount || offer.productName || 'Standard';
}

function trackVendorClick(
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
}

function offerHref(offer: AffiliateOffer | undefined): string | null {
  const href = offer?.href?.trim();
  if (!href || href === '#') return null;
  return href;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement('input');
    input.value = value;
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
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const { isAdmin } = useAdminAccess();

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
          const primaryHref = offerHref(primary);
          const linkCopied = copiedLinkId === group.vendorId;
          const couponCopied = copiedCouponId === group.vendorId;

          return (
            <div
              key={group.vendorId}
              className={cellClass}
              data-preferred={preferred ? 'true' : undefined}
              data-cheapest={isCheapest ? 'true' : undefined}
            >
              {preferred ? (
                <TrustedSourceBadge className="lib-vg__preferred-tag" />
              ) : isCheapest ? (
                <LowestPriceBadge className="lib-vg__best-tag" />
              ) : null}

              <div className="lib-vg__vendor-head">
                {primaryHref ? (
                  <a
                    href={primaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lib-vg__vendor lib-vg__vendor-link"
                    title={`Open ${group.vendorLabel} (right-click to copy link)`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (primary) {
                        trackVendorClick(primary, peptideId, peptideName);
                      }
                    }}
                  >
                    {group.vendorLabel}
                  </a>
                ) : (
                  <span className="lib-vg__vendor">{group.vendorLabel}</span>
                )}
                <div className="lib-vg__meta">
                  <div
                    className="lib-vg__lab"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <PartnerLabScore vendorId={group.vendorId} />
                  </div>
                  {isAdmin && primaryHref ? (
                    <button
                      type="button"
                      className="lib-vg__copy-link"
                      title="Copy referral link"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void copyText(primaryHref).then(() => {
                          setCopiedLinkId(group.vendorId);
                          window.setTimeout(() => setCopiedLinkId(null), 1400);
                          void trackAnalyticsEvent({
                            name: 'affiliate_click',
                            meta: {
                              partnerId: group.vendorId,
                              partnerLabel: group.vendorLabel,
                              peptideId,
                              peptideName,
                              href: primaryHref,
                              action: 'copy_link',
                            },
                          });
                        });
                      }}
                    >
                      {linkCopied ? (
                        'Link copied'
                      ) : (
                        <>
                          <Link2 className="size-3" aria-hidden />
                          Copy link
                        </>
                      )}
                    </button>
                  ) : null}
                  {group.couponCode.trim() ? (
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
                        void copyText(group.couponCode.toUpperCase()).then(
                          () => {
                            setCopiedCouponId(group.vendorId);
                            window.setTimeout(
                              () => setCopiedCouponId(null),
                              1400,
                            );
                          },
                        );
                      }}
                    >
                      {couponCopied ? (
                        <>
                          <Copy className="size-3" aria-hidden />
                          Copied
                        </>
                      ) : group.discountLabel ? (
                        `${group.couponCode.toUpperCase()} · ${group.discountLabel}`
                      ) : (
                        group.couponCode.toUpperCase()
                      )}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="lib-vg__sizes">
                {group.hasKnownSizes ? (
                  group.sizes.map((offer) => {
                    const href = offerHref(offer);
                    if (!href) {
                      return (
                        <div key={offer.id} className="lib-vg__size-row">
                          <span className="lib-vg__size-row__top">
                            <span className="lib-vg__sku">
                              {sizeLabel(offer)}
                            </span>
                          </span>
                          <OfferPrice
                            offer={offer}
                            size="sm"
                            className="lib-vg__price"
                          />
                        </div>
                      );
                    }
                    return (
                      <a
                        key={offer.id}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lib-vg__size-row"
                        title={`Open ${group.vendorLabel} — ${sizeLabel(offer)} (right-click to copy link)`}
                        onClick={(event) => {
                          event.stopPropagation();
                          trackVendorClick(offer, peptideId, peptideName);
                        }}
                      >
                        <span className="lib-vg__size-row__top">
                          <span className="lib-vg__sku">{sizeLabel(offer)}</span>
                          <ExternalLink className="lib-vg__icon" aria-hidden />
                        </span>
                        <OfferPrice
                          offer={offer}
                          size="sm"
                          className="lib-vg__price"
                        />
                      </a>
                    );
                  })
                ) : primary && primaryHref ? (
                  <a
                    href={primaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lib-vg__size-row lib-vg__size-row--price-only"
                    title={`Open ${group.vendorLabel} (right-click to copy link)`}
                    onClick={(event) => {
                      event.stopPropagation();
                      trackVendorClick(primary, peptideId, peptideName);
                    }}
                  >
                    <span className="lib-vg__size-row__top">
                      <span className="lib-vg__sku">Price</span>
                      <ExternalLink className="lib-vg__icon" aria-hidden />
                    </span>
                    <span className="lib-vg__price font-[family-name:var(--font-display)] font-semibold tabular-nums text-foreground text-sm">
                      {priceRangeLabel(group)}
                    </span>
                  </a>
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
