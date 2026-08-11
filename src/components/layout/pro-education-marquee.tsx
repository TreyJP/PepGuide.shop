'use client';

import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useUiStore } from '@/src/stores/ui-store';

import './pro-education-marquee.css';

const MESSAGE = 'New Educational Videos Unlocked Every Week With Pro';
const DISMISS_KEY = 'pepguide.pro-education-marquee.dismissed';

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
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  if (!ready || dismissed) return null;

  return (
    <div className="pro-marquee">
      <button
        type="button"
        className="pro-marquee__cta"
        onClick={() => openProSubscribeModal('Education & Research')}
        aria-label={`${MESSAGE}. Open PepGuide Pro details.`}
      >
        <span className="sr-only">{MESSAGE}</span>
        <div className="pro-marquee__viewport">
          <MarqueeTrack />
          <MarqueeTrack />
        </div>
      </button>
      <button
        type="button"
        className="pro-marquee__dismiss"
        aria-label="Dismiss banner"
        onClick={() => {
          try {
            window.localStorage.setItem(DISMISS_KEY, '1');
          } catch {
            // ignore quota / private mode
          }
          setDismissed(true);
        }}
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
