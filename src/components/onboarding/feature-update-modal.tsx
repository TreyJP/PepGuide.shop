'use client';

import { Bookmark, MessageCircleQuestion, Star } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { ModalShell } from '@/src/components/ui/modal-shell';

const DISMISS_KEY = 'pepguide.feature-update.v1.dismissed';

const FEATURES = [
  {
    href: '/pro/vendor-reviews',
    icon: Star,
    title: 'Vendor Reviews',
    description:
      'Browse community vendor reviews and share your own experience with suppliers.',
  },
  {
    href: '/pro/ask',
    icon: MessageCircleQuestion,
    title: 'Ask a Professional',
    description:
      'Submit a private question and discuss it directly with the PepGuide team.',
  },
  {
    href: '/pro/bookmarks',
    icon: Bookmark,
    title: 'Bookmarking',
    description:
      'Save peptides, chats, and pages you want to come back to later.',
  },
] as const;

export function FeatureUpdateModal() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(DISMISS_KEY) !== '1');
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Ignore storage failures — still close for this session.
    }
    setOpen(false);
  }, []);

  if (!ready) return null;

  return (
    <ModalShell
      open={open}
      title="New feature update"
      titleId="feature-update-modal-title"
      eyebrow="PepGuide"
      description="A few new tools are now available in the sidebar."
      onClose={dismiss}
      className="max-w-lg"
      footer={
        <div className="flex justify-end">
          <Button onClick={dismiss}>Got it</Button>
        </div>
      }
    >
      <ul className="space-y-3">
        {FEATURES.map(({ href, icon: Icon, title, description }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={dismiss}
              className="flex gap-3 rounded-[14px] border border-border bg-surface-secondary/60 p-3 transition-colors hover:border-accent/40 hover:bg-surface-secondary"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-accent/10 text-accent">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {title}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-foreground-secondary">
                  {description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}
