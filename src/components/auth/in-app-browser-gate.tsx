'use client';

import { ExternalLink, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  copyCurrentUrl,
  inAppBrowserName,
  isInAppBrowser,
  tryOpenInSystemBrowser,
} from '@/src/lib/in-app-browser';

export function InAppBrowserGate() {
  const [active, setActive] = useState(false);
  const [appName, setAppName] = useState('this in-app browser');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActive(isInAppBrowser());
    setAppName(inAppBrowserName());
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      <div className="mx-auto max-w-lg rounded-[18px] border border-accent/25 bg-surface p-4 shadow-[0_16px_40px_rgba(10,27,58,0.18)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Open in your browser
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
          Sign-in doesn’t work in {appName}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary">
          Links from Discord open an in-app browser that blocks PepGuide login.
          Open this page in Safari or Chrome, then sign in and chat there.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-foreground-secondary">
          <li>Tap ··· or the share menu</li>
          <li>Choose <span className="font-medium text-foreground">Open in Safari / Chrome</span></li>
          <li>Sign in again on that browser</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="flex-1"
            onClick={() => tryOpenInSystemBrowser()}
          >
            <ExternalLink className="size-4" />
            Open in browser
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => {
              void copyCurrentUrl().then((ok) => {
                if (!ok) return;
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      </div>
    </div>
  );
}
