'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { OfferPrice } from '@/src/components/affiliates/offer-price';
import {
  LowestPriceBadge,
  TrustedSourceBadge,
} from '@/src/components/affiliates/partner-badges';
import { PartnerLabScore } from '@/src/components/affiliates/partner-lab-score';
import { LibraryFromPrice } from '@/src/components/library/library-from-price';
import { BookmarkToggleButton } from '@/src/components/pro/bookmark-toggle-button';
import type { ProtocolPeptide, ProProtocol } from '@/src/data/pro/protocols';
import { isPreferredPartner } from '@/src/data/affiliates/preferred-partners';
import {
  formatAffiliateUsd,
  type AffiliateOffer,
} from '@/src/data/affiliates/slots';
import {
  groupOffersByVendor,
  type VendorOfferGroup,
} from '@/src/lib/affiliate-offers';
import { resolvePartnerOffers } from '@/src/lib/affiliate-offers';
import { buildLibraryPricingMap } from '@/src/lib/library-pricing';
import { peptideRepository } from '@/src/services/firestore/peptides';
import { trackAnalyticsEvent } from '@/src/services/firestore/analytics';
import { usePartnersStore } from '@/src/stores/partners-store';
import type { Peptide } from '@/src/types';

import './protocol-shop.css';

function sizeLabel(offer: AffiliateOffer): string {
  return offer.testAmount || offer.productName || 'Standard';
}

function priceRangeLabel(group: VendorOfferGroup): string {
  const low = formatAffiliateUsd(group.lowestSalePriceUsd);
  if (group.highestSalePriceUsd <= group.lowestSalePriceUsd) return low;
  return `${low} – ${formatAffiliateUsd(group.highestSalePriceUsd)}`;
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

function ProtocolVendorCard({
  group,
  peptideId,
  peptideName,
  isCheapest,
}: {
  group: VendorOfferGroup;
  peptideId: string;
  peptideName: string;
  isCheapest: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const preferred = isPreferredPartner(group.vendorId, group.vendorLabel);

  return (
    <div
      className={[
        'ps-vendor',
        preferred ? 'ps-vendor--preferred' : null,
        isCheapest ? 'ps-vendor--best' : null,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="ps-vendor__top">
        <p className="ps-vendor__name">{group.vendorLabel}</p>
        {preferred ? (
          <TrustedSourceBadge className="ps-vendor__tag ps-vendor__tag--trusted" />
        ) : isCheapest ? (
          <LowestPriceBadge className="ps-vendor__tag ps-vendor__tag--lowest" />
        ) : null}
        <PartnerLabScore vendorId={group.vendorId} />
        {group.couponCode.trim() ? (
          <button
            type="button"
            className="ps-vendor__coupon"
            onClick={() => {
              void copyCoupon(group.couponCode.toUpperCase()).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              });
            }}
          >
            {copied
              ? 'Copied'
              : `${group.couponCode.toUpperCase()} · ${group.discountLabel}`}
          </button>
        ) : null}
      </div>

      <div className="ps-sizes">
        {group.hasKnownSizes ? (
          group.sizes.map((offer) => (
            <button
              key={offer.id}
              type="button"
              className="ps-size"
              onClick={() => openVendor(offer, peptideId, peptideName)}
            >
              <span className="ps-size__label">{sizeLabel(offer)}</span>
              <span className="ps-size__right">
                <OfferPrice offer={offer} size="sm" />
                <ExternalLink className="ps-size__icon" aria-hidden />
              </span>
            </button>
          ))
        ) : (
          <button
            type="button"
            className="ps-size"
            onClick={() =>
              openVendor(group.sizes[0]!, peptideId, peptideName)
            }
          >
            <span className="ps-size__label">Price range</span>
            <span className="ps-size__right">
              <span className="ps-size__range">{priceRangeLabel(group)}</span>
              <ExternalLink className="ps-size__icon" aria-hidden />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function ProtocolShopCompound({
  entry,
  peptide,
  index,
}: {
  entry: ProtocolPeptide;
  peptide: Peptide | null;
  index: number;
}) {
  const partners = usePartnersStore((state) => state.partners);
  const [expanded, setExpanded] = useState(false);
  const offers = useMemo(
    () => resolvePartnerOffers(partners, entry.peptideId, 'allSkus'),
    [partners, entry.peptideId],
  );
  const groups = useMemo(() => groupOffersByVendor(offers), [offers]);
  const pricing = useMemo(
    () => buildLibraryPricingMap([entry.peptideId], partners)[entry.peptideId],
    [entry.peptideId, partners],
  );

  const previewCount = 1;
  const cheapest =
    groups.length > 0
      ? Math.min(...groups.map((group) => group.lowestSalePriceUsd))
      : null;
  const visible = expanded ? groups : groups.slice(0, previewCount);
  const hidden = Math.max(0, groups.length - previewCount);

  return (
    <section className="ps-compound">
      <header className="ps-compound__head">
        <div className="ps-compound__meta">
          <span className="ps-compound__index">{index + 1}</span>
          <span className="ps-compound__role">{entry.role}</span>
        </div>
        <div className="ps-compound__title-row">
          <Link
            href={`/library/${entry.peptideId}`}
            className="ps-compound__title"
          >
            {entry.name}
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <LibraryFromPrice
              pricing={pricing}
              size="sm"
              className="ps-compound__from"
            />
            <BookmarkToggleButton
              compact
              input={{
                kind: 'peptide',
                peptideId: entry.peptideId,
                title: entry.name,
                subtitle: peptide?.classification ?? entry.role,
              }}
            />
          </div>
        </div>
        <p className="ps-compound__note">{entry.researchNote}</p>
      </header>

      <div className="ps-vendors">
        {groups.length === 0 ? (
          <p className="ps-empty">No vendor prices yet for this compound.</p>
        ) : (
          <>
            {visible.map((group) => (
              <ProtocolVendorCard
                key={group.vendorId}
                group={group}
                peptideId={entry.peptideId}
                peptideName={entry.name}
                isCheapest={
                  cheapest != null && group.lowestSalePriceUsd === cheapest
                }
              />
            ))}
            {hidden > 0 ? (
              <button
                type="button"
                className="ps-more"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded
                  ? 'Show fewer vendors'
                  : hidden === 1
                    ? 'Show 1 more vendor'
                    : `Show ${hidden} more vendors`}
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

function ProtocolBrowseList({ protocol }: { protocol: ProProtocol }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-secondary">
        Compounds in this stack
      </p>
      <ul className="space-y-3">
        {protocol.peptides.map((entry, index) => (
          <li
            key={entry.peptideId}
            className="rounded-[14px] bg-surface-secondary/70 px-3.5 py-3.5"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-[11px] font-semibold text-accent">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {entry.name}
                  </p>
                  <p className="text-xs text-accent">{entry.role}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground-secondary">
                  {entry.researchNote}
                </p>
                <Link
                  href={`/library/${entry.peptideId}`}
                  className="mt-2.5 inline-block text-xs font-semibold text-accent hover:underline"
                >
                  Open in Library →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ProtocolPeptideLibraryProps = {
  protocol: ProProtocol;
  /**
   * When true (bookmark / shopping view), show vendor prices.
   * Protocols browse view keeps compounds only — no prices.
   */
  showVendors?: boolean;
};

/** Peptide board for a protocol stack. */
export function ProtocolPeptideLibrary({
  protocol,
  showVendors = false,
}: ProtocolPeptideLibraryProps) {
  const partnersLoaded = usePartnersStore((state) => state.loaded);
  const loadPartners = usePartnersStore((state) => state.loadPartners);
  const [byId, setById] = useState<Record<string, Peptide>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showVendors && !partnersLoaded) void loadPartners();
  }, [showVendors, partnersLoaded, loadPartners]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void peptideRepository
      .getByIds(protocol.peptides.map((item) => item.peptideId))
      .then((peptides) => {
        if (cancelled) return;
        const map: Record<string, Peptide> = {};
        for (const peptide of peptides) map[peptide.id] = peptide;
        setById(map);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [protocol.id, protocol.peptides]);

  if (!showVendors) {
    return <ProtocolBrowseList protocol={protocol} />;
  }

  return (
    <div className="ps-shop">
      <div className="ps-shop__intro">
        <p className="ps-shop__eyebrow">Stack shopping</p>
        <p className="ps-shop__blurb">
          One compound at a time — start with the top vendor, then open more
          if you want to compare.
        </p>
        <p className="ps-shop__count">
          {protocol.peptides.length} peptide
          {protocol.peptides.length === 1 ? '' : 's'}
        </p>
      </div>

      {loading || !partnersLoaded ? (
        <p className="ps-empty">Loading vendors…</p>
      ) : (
        protocol.peptides.map((entry, index) => (
          <ProtocolShopCompound
            key={entry.peptideId}
            entry={entry}
            peptide={byId[entry.peptideId] ?? null}
            index={index}
          />
        ))
      )}
    </div>
  );
}
