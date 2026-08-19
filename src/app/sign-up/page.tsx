'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { AuthLayout } from '@/src/components/auth/auth-layout';
import { SignUpForm } from '@/src/components/auth/sign-up-form';
import {
  normalizeReferralCode,
  stashReferralCode,
} from '@/src/lib/referral-code';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const openSignInModal = useUiStore((state) => state.openSignInModal);

  const referralFromUrl = normalizeReferralCode(
    searchParams.get('ref') || searchParams.get('code'),
  );

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/chat');
    }
  }, [initializing, user, router]);

  useEffect(() => {
    if (referralFromUrl) stashReferralCode(referralFromUrl);
  }, [referralFromUrl]);

  return (
    <AuthLayout
      title="Create your account"
      description="Start organizing peptide research with PepGuide."
      footer={
        <>
          Already have an account?{' '}
          <button
            type="button"
            className="font-medium text-accent hover:underline"
            onClick={() => openSignInModal()}
          >
            Sign in
          </button>
        </>
      }
    >
      <SignUpForm
        initialReferralCode={referralFromUrl || ''}
        onSuccess={() => router.replace('/chat')}
      />
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Create your account" description="Loading…">
          <div className="h-40 animate-pulse rounded-[14px] bg-surface-secondary/50" />
        </AuthLayout>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}
