'use client';

import { Check, Sparkles, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { ProExplainerVideo } from '@/src/components/billing/pro-explainer-video';
import { Button } from '@/src/components/ui/button';
import { PRO_BILLING, PRO_COMING_SOON } from '@/src/constants/billing';
import { startProCheckout } from '@/src/lib/billing/start-pro-checkout';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

export function ProSubscribeModal() {
  const open = useUiStore((state) => state.proSubscribeModalOpen);
  const feature = useUiStore((state) => state.proSubscribeFeature);
  const closeProSubscribeModal = useUiStore(
    (state) => state.closeProSubscribeModal,
  );
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoading(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeProSubscribeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, closeProSubscribeModal]);

  if (!open) return null;

  const shell = (body: ReactNode) => (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-subscribe-title"
      onClick={closeProSubscribeModal}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] border border-border bg-surface shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {body}
      </div>
    </div>
  );

  // Coming soon must never show pricing / Stripe — keep this branch first.
  if (PRO_COMING_SOON) {
    return shell(
      <>
        <div className="bg-[linear-gradient(160deg,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_70%)] px-6 pb-5 pt-6">
          <button
            type="button"
            onClick={closeProSubscribeModal}
            className="absolute right-3 top-3 z-10 rounded-[10px] p-2 text-foreground-secondary hover:bg-surface-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            <Sparkles className="size-3" />
            PepGuide Pro
          </div>
          <h2
            id="pro-subscribe-title"
            className="mt-3 pr-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground"
          >
            Coming soon
          </h2>
          <p className="mt-1.5 text-sm text-foreground-secondary">
            {feature === 'PepGuide Pro' ? 'PepGuide Pro' : feature} isn’t open
            for signup yet. {PRO_BILLING.tagline} will launch here — Chat,
            Questions & Discussion, Library, Cycle, and Calculator stay free
            for now.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <ul className="space-y-2.5">
            {PRO_BILLING.features.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
                  <Check className="size-3" />
                </span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full" disabled>
            Coming soon
          </Button>
          <p className="text-center text-xs text-foreground-secondary">
            Educational research content only — not medical advice.
          </p>
        </div>
      </>,
    );
  }

  const handleSubscribe = async () => {
    if (!user) {
      closeProSubscribeModal();
      openSignInModal(
        'Sign in to subscribe to PepGuide Pro and unlock Education & Research, Protocols, Bookmarks, and Ask a Professional.',
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await startProCheckout();
      setLoading(false);
      closeProSubscribeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout.');
      setLoading(false);
    }
  };

  return shell(
    <>
      <div className="bg-[linear-gradient(160deg,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_70%)] px-6 pb-5 pt-6">
        <button
          type="button"
          onClick={closeProSubscribeModal}
          className="absolute right-3 top-3 z-10 rounded-[10px] p-2 text-foreground-secondary hover:bg-surface-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          <Sparkles className="size-3" />
          PepGuide Pro
        </div>
        <h2
          id="pro-subscribe-title"
          className="mt-3 pr-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground"
        >
          Unlock {feature}
        </h2>
        <p className="mt-1.5 text-sm text-foreground-secondary">
          {PRO_BILLING.tagline}. Free Chat, Questions & Discussion, Library,
          Cycle, and Calculator stay available.
        </p>

        <ProExplainerVideo feature={feature} className="mt-5" />

        <div className="mt-5 flex items-end gap-1">
          <span className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-foreground">
            ${PRO_BILLING.priceUsd}
          </span>
          <span className="mb-1 text-sm text-foreground-secondary">/month</span>
        </div>
      </div>

      <div className="space-y-5 px-6 py-5">
        <ul className="space-y-2.5">
          {PRO_BILLING.features.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
                <Check className="size-3" />
              </span>
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>

        {error ? <p className="text-sm text-critical">{error}</p> : null}

        <Button
          className="w-full"
          onClick={() => void handleSubscribe()}
          disabled={loading}
        >
          {loading
            ? 'Redirecting to Stripe…'
            : user
              ? `Continue to Stripe — ${PRO_BILLING.priceLabel}`
              : 'Sign in to subscribe'}
        </Button>

        <p className="text-center text-xs text-foreground-secondary">
          Secure checkout powered by Stripe. Cancel anytime. Educational
          research content only — not medical advice.
        </p>
      </div>
    </>,
  );
}
