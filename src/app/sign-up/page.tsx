'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AuthLayout } from '@/src/components/auth/auth-layout';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { BRAND } from '@/src/constants/brand';
import {
  normalizeReferralCode,
  stashReferralCode,
} from '@/src/lib/referral-code';
import { getAuthErrorMessage } from '@/src/lib/firebase-errors';
import { signUpSchema, type SignUpInput } from '@/src/schemas/auth';
import { authService } from '@/src/services/auth';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      isAdult: undefined,
      acceptTerms: undefined,
      acceptPrivacy: undefined,
      acceptResearchNotice: undefined,
      referralCode: referralFromUrl || '',
    },
  });

  const referralCodeValue = watch('referralCode');
  useEffect(() => {
    stashReferralCode(referralCodeValue);
  }, [referralCodeValue]);

  const onSubmit = async (values: SignUpInput) => {
    setError(null);
    try {
      if (authService.isMockMode()) {
        setError(
          'This site is in mock mode, so accounts can’t unlock chat. Set NEXT_PUBLIC_USE_MOCK_SERVICES=false on Vercel and redeploy.',
        );
        return;
      }

      stashReferralCode(values.referralCode);
      const signedIn = await authService.signUp(values);
      setUser(signedIn);

      const auth = getFirebaseAuth();
      await auth?.authStateReady();
      const firebaseUser = auth?.currentUser;
      if (!firebaseUser) {
        setError(
          'Account created, but the secure session didn’t finish loading. Please sign in again.',
        );
        return;
      }
      await firebaseUser.getIdToken(true);

      router.replace('/chat');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      if (authService.isMockMode()) {
        setError(
          'This site is in mock mode, so Google sign-in can’t unlock a real session. Set NEXT_PUBLIC_USE_MOCK_SERVICES=false and configure Firebase, then restart.',
        );
        setGoogleLoading(false);
        return;
      }

      stashReferralCode(referralCodeValue || referralFromUrl);
      const signedIn = await authService.signInWithGoogle();
      if (!signedIn) return;
      setUser(signedIn);
      router.replace('/chat');
    } catch (err) {
      console.error('[PepGuide auth] Google sign-in UI error', err);
      setError(getAuthErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Start organizing peptide research with PepGuide."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Display name"
          autoComplete="name"
          error={errors.displayName?.message}
          {...register('displayName')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters with a letter and number"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Input
          label="Referral code (optional)"
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="If you have one"
          hint="From a PepGuide affiliate — leave blank if none"
          error={errors.referralCode?.message}
          {...register('referralCode')}
        />

        <div className="space-y-1 rounded-[14px] border border-border bg-surface-secondary/40 p-2">
          <Controller
            name="isAdult"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="I confirm I am at least 18 years old"
                checked={field.value === true}
                onChange={(event) =>
                  field.onChange(event.target.checked ? true : undefined)
                }
              />
            )}
          />
          {errors.isAdult ? (
            <p className="px-3 text-sm text-critical">{errors.isAdult.message}</p>
          ) : null}

          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={
                  <>
                    I accept the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Terms of Service
                    </Link>
                  </>
                }
                checked={field.value === true}
                onChange={(event) =>
                  field.onChange(event.target.checked ? true : undefined)
                }
              />
            )}
          />
          {errors.acceptTerms ? (
            <p className="px-3 text-sm text-critical">{errors.acceptTerms.message}</p>
          ) : null}

          <Controller
            name="acceptPrivacy"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={
                  <>
                    I accept the{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </>
                }
                checked={field.value === true}
                onChange={(event) =>
                  field.onChange(event.target.checked ? true : undefined)
                }
              />
            )}
          />
          {errors.acceptPrivacy ? (
            <p className="px-3 text-sm text-critical">{errors.acceptPrivacy.message}</p>
          ) : null}

          <Controller
            name="acceptResearchNotice"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Research acknowledgment"
                description={BRAND.researchAcknowledgment}
                checked={field.value === true}
                onChange={(event) =>
                  field.onChange(event.target.checked ? true : undefined)
                }
              />
            )}
          />
          {errors.acceptResearchNotice ? (
            <p className="px-3 text-sm text-critical">
              {errors.acceptResearchNotice.message}
            </p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-critical">{error}</p> : null}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          loading={googleLoading}
          onClick={() => void onGoogle()}
        >
          Continue with Google
        </Button>
      </form>
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
      <SignUpForm />
    </Suspense>
  );
}
