'use client';

import { ModalShell } from '@/src/components/ui/modal-shell';
import { parseProExplainerVideoUrl } from '@/src/lib/pro-explainer-video';

export type GuideVideoModalProps = {
  open: boolean;
  title: string;
  description?: string;
  videoUrl: string | null | undefined;
  onClose: () => void;
};

export function GuideVideoModal({
  open,
  title,
  description,
  videoUrl,
  onClose,
}: GuideVideoModalProps) {
  const source = parseProExplainerVideoUrl(videoUrl);

  return (
    <ModalShell
      open={open}
      title={title}
      titleId="guide-video-modal-title"
      eyebrow="Guide"
      description={description}
      onClose={onClose}
      className="max-w-3xl sm:max-w-3xl"
      footer="Educational research content only. Not medical advice."
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black">
        {source?.kind === 'youtube' || source?.kind === 'vimeo' ? (
          <iframe
            key={source.embedUrl}
            title={title}
            src={`${source.embedUrl}${source.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : source?.kind === 'file' ? (
          <video
            key={source.src}
            className="absolute inset-0 size-full bg-black object-contain"
            controls
            autoPlay
            playsInline
            preload="metadata"
            aria-label={title}
          >
            <source src={source.src} />
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/80">
            This video isn’t available yet.
          </div>
        )}
      </div>
    </ModalShell>
  );
}
