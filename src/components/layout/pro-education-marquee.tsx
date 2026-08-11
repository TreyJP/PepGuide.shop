'use client';

import { Sparkles } from 'lucide-react';

import { PRO_COMING_SOON } from '@/src/constants/billing';
import { useProAccess } from '@/src/hooks/use-pro-access';
import { useUiStore } from '@/src/stores/ui-store';

import './pro-education-marquee.css';

const MESSAGE = 'New Educational Videos Unlocked Every Week With Pro';

function MarqueeTrack() {
  return (
    <div className="pro-marquee__track" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} className="pro-marquee__item">
          <Sparkles className="pro-marquee__icon" aria-hidden />
          {MESSAGE}
        </span>
      ))}
    </div>
  );
}

/** Continuous top ticker promoting weekly Pro education releases. */
export function ProEducationMarquee() {
  const { isPro } = useProAccess();
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );

  if (isPro && !PRO_COMING_SOON) return null;

  return (
    <button
      type="button"
      className="pro-marquee"
      onClick={() => openProSubscribeModal('Education & Research')}
      aria-label={`${MESSAGE}. Open PepGuide Pro details.`}
    >
      <span className="sr-only">{MESSAGE}</span>
      <div className="pro-marquee__viewport">
        <MarqueeTrack />
        <MarqueeTrack />
      </div>
    </button>
  );
}
