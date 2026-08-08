'use client';

import { Play } from 'lucide-react';

import { PRO_BILLING } from '@/src/constants/billing';
import { parseProExplainerVideoUrl } from '@/src/lib/pro-explainer-video';

type ProExplainerVideoProps = {
  /** Feature the user clicked — used in the placeholder label. */
  feature?: string;
  className?: string;
};

/**
 * Video slot shown when a locked Pro feature opens the subscribe modal.
 * Set NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_URL to a YouTube, Vimeo, or /public mp4 URL.
 */
export function ProExplainerVideo({
  feature,
  className,
}: ProExplainerVideoProps) {
  const source = parseProExplainerVideoUrl(PRO_BILLING.explainerVideoUrl);
  const title = feature
    ? `What you get with PepGuide Pro — ${feature}`
    : 'What you get with PepGuide Pro';

  return (
    <div className={className}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
        See what Pro includes
      </p>
      <div className="relative aspect-video overflow-hidden rounded-[16px] border border-border bg-[linear-gradient(145deg,#0A1B3A_0%,#102a5c_55%,#0057FF_140%)]">
        {source?.kind === 'youtube' || source?.kind === 'vimeo' ? (
          <iframe
            title={title}
            src={source.embedUrl}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : source?.kind === 'file' ? (
          <video
            className="absolute inset-0 size-full object-cover"
            controls
            playsInline
            preload="metadata"
            poster={PRO_BILLING.explainerVideoPoster || undefined}
            aria-label={title}
          >
            <source src={source.src} />
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm">
              <Play className="size-5 fill-current" />
            </span>
            <p className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
              Pro walkthrough
            </p>
            <p className="max-w-[16rem] text-xs leading-relaxed text-white/75">
              Education & Research and Protocols — see what members unlock with
              PepGuide Pro.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
