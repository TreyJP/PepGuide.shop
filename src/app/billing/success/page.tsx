'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { userRepository } from '@/src/services/firestore/users';
import { useAuthStore } from '@/src/stores/auth-store';

function BillingSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your PepGuide Pro subscription…');

  useEffect(() => {
    if (initializing) return;
    let cancelled = false;

    async function confirm() {
      if (!sessionId) {
        setStatus('error');
        setMessage('Missing checkout session.');
        return;
      }

      try {
        const token = await getFirebaseAuth()?.currentUser?.getIdToken();
        if (!token) {
          setStatus('error');
          setMessage('Sign in again to finish activating PepGuide Pro.');
          return;
        }

        const response = await fetch('/api/billing/confirm', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await response.json()) as { tier?: string; error?: string };
        if (!response.ok) {
          throw new Error(data.error || 'Unable to confirm payment.');
        }

        const uid = getFirebaseAuth()?.currentUser?.uid;
        if (uid) {
          const profile = await userRepository.getProfile(uid);
          if (profile && !cancelled) {
            setUser(profile);
          } else if (!cancelled && user) {
            setUser({ ...user, subscriptionTier: 'pro' });
          }
        }

        if (!cancelled) {
          setStatus('ready');
          setMessage(
            'PepGuide Pro is active. Education & Research and Protocols are unlocked.',
          );
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            error instanceof Error
              ? error.message
              : 'Payment may have succeeded — refresh after a moment.',
          );
        }
      }
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [sessionId, setUser, user, initializing]);

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[22px] border border-border bg-surface p-6 text-center shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          PepGuide Pro
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          {status === 'ready' ? 'You’re in' : status === 'error' ? 'Almost there' : 'Processing'}
        </h1>
        <p className="mt-2 text-sm text-foreground-secondary">{message}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => router.push('/pro/guides')}>
            Open Education & Research
          </Button>
          <Button variant="secondary" onClick={() => router.push('/pro/protocols')}>
            Open Protocols
          </Button>
          <Link
            href="/chat"
            className="text-sm text-foreground-secondary hover:text-foreground"
          >
            Back to Chat
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center text-foreground-secondary">
          Confirming subscription…
        </div>
      }
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
