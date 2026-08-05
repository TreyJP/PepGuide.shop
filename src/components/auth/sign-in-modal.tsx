'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { X } from 'lucide-react';

import { Logo } from '@/src/components/brand/logo';
import { Button } from '@/src/components/ui/button';
import { BRAND } from '@/src/constants/brand';

type SignInModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

export function SignInModal({
  open,
  onClose,
  message = 'Sign in to start researching with PepGuide AI and save your chats.',
}: SignInModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-in-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[18px] border border-border bg-surface p-5 shadow-xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-[10px] p-2 text-foreground-secondary hover:bg-surface-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <Logo variant="full" size="lg" priority className="max-w-[220px]" />
          <div>
            <h2
              id="sign-in-modal-title"
              className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground"
            >
              Sign in to continue
            </h2>
            <p className="mt-2 text-sm text-foreground-secondary">{message}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              onClose();
              router.push('/sign-in');
            }}
          >
            Sign in
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              onClose();
              router.push('/sign-up');
            }}
          >
            Create account
          </Button>
          <p className="pt-1 text-center text-xs text-foreground-secondary">
            <Link href="/welcome" className="text-accent hover:underline" onClick={onClose}>
              Learn about {BRAND.name}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
