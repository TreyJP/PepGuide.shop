'use client';

import { Play, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { PRO_COMING_SOON } from '@/src/constants/billing';
import { PEPTIDE_OF_THE_WEEK } from '@/src/data/pro/peptide-of-the-week';
import { startProCheckout } from '@/src/lib/billing/start-pro-checkout';
import { parseProExplainerVideoUrl } from '@/src/lib/pro-explainer-video';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

import './peptide-of-week.css';

export function PeptideOfWeekBanner() {
  const [open, setOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const potw = PEPTIDE_OF_THE_WEEK;
  const source = parseProExplainerVideoUrl(potw.videoUrl);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function openProDetails() {
    setOpen(false);
    openProSubscribeModal('Education & Research');
  }

  async function handleUnlockProDirect() {
    setCheckoutError(null);
    // While Pro is in coming-soon mode, never jump straight to Stripe.
    if (PRO_COMING_SOON) {
      openProDetails();
      return;
    }
    if (!user) {
      setOpen(false);
      openSignInModal(
        'Sign in to subscribe to PepGuide Pro and unlock all educational videos.',
      );
      return;
    }
    setCheckoutBusy(true);
    try {
      await startProCheckout();
    } catch (err) {
      setCheckoutBusy(false);
      setCheckoutError(
        err instanceof Error ? err.message : 'Unable to start checkout.',
      );
    }
  }

  return (
    <>
      <button
        type="button"
        className="potw-banner"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="potw-banner__glow" aria-hidden />
        <span className="potw-banner__inner">
          <span className="potw-banner__pill">
            <Sparkles className="size-3.5" aria-hidden />
            {potw.weekLabel}
          </span>
          <span className="potw-banner__copy">
            <span className="potw-banner__title">
              This week’s peptide of the week
            </span>
            <span className="potw-banner__name">{potw.name}</span>
          </span>
          <span className="potw-banner__cta">
            <Play className="size-3.5 fill-current" aria-hidden />
            Watch
          </span>
        </span>
      </button>

      {open ? (
        <div className="potw-modal">
          <button
            type="button"
            className="potw-modal__backdrop"
            aria-label="Close peptide of the week"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="potw-modal-title"
            className="potw-modal__panel"
          >
            <div className="potw-modal__header">
              <div className="min-w-0 flex-1">
                <p className="potw-modal__eyebrow">{potw.weekLabel}</p>
                <h2 id="potw-modal-title" className="potw-modal__title">
                  {potw.headline}
                </h2>
                <p className="potw-modal__blurb">{potw.blurb}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="size-9 shrink-0 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="potw-modal__body">
              <div className="potw-modal__stage">
                {source?.kind === 'youtube' || source?.kind === 'vimeo' ? (
                  <iframe
                    title={potw.headline}
                    src={`${source.embedUrl}${source.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                    className="absolute inset-0 size-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : source?.kind === 'file' ? (
                  <video
                    className="absolute inset-0 size-full object-cover"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    poster={potw.posterUrl || undefined}
                    aria-label={potw.headline}
                  >
                    <source src={source.src} />
                  </video>
                ) : (
                  <div className="potw-modal__placeholder">
                    <span className="potw-modal__play">
                      <Play className="size-5 fill-current sm:size-6" />
                    </span>
                    <p className="font-[family-name:var(--font-display)] text-base font-semibold text-white sm:text-lg">
                      {potw.name} education video
                    </p>
                    <p className="max-w-sm text-xs text-white/70 sm:text-sm">
                      This week’s featured walkthrough will play here. Browse the
                      library entry below, or unlock Pro for the full education
                      library.
                    </p>
                  </div>
                )}
              </div>

              <div className="potw-modal__footer">
                <Link
                  href={`/library/${potw.peptideId}`}
                  className="potw-modal__library-link"
                  onClick={() => setOpen(false)}
                >
                  View {potw.name} in library
                </Link>
                <button
                  type="button"
                  className="potw-modal__unlock"
                  disabled={checkoutBusy}
                  onClick={() => void handleUnlockProDirect()}
                >
                  {PRO_COMING_SOON
                    ? 'Coming soon'
                    : checkoutBusy
                      ? 'Redirecting to Stripe…'
                      : 'Unlock Pro to access all educational videos'}
                </button>
                {checkoutError ? (
                  <p className="w-full text-center text-xs text-red-200 sm:text-left">
                    {checkoutError}{' '}
                    <button
                      type="button"
                      className="underline"
                      onClick={openProDetails}
                    >
                      Open Pro details
                    </button>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
