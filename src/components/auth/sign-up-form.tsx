'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import '@/src/components/auth/auth-forms.css';
import {
  AuthFormDivider,
  GoogleAuthButton,
} from '@/src/components/auth/google-auth-button';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Input } from '@/src/components/ui/input';
import { BRAND } from '@/src/constants/brand';
import { getAuthErrorMessage } from '@/src/lib/firebase-errors';
import {
  normalizeReferralCode,
  stashReferralCode,
} from '@/src/lib/referral-code';
import { signUpSchema, type SignUpInput } from '@/src/schemas/auth';
import { authService } from '@/src/services/auth';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';

export type SignUpFormProps = {
  onSuccess?: () => void;
  initialReferralCode?: string;
};

export function SignUpForm({
  onSuccess,
  initialReferralCode = '',
}: SignUpFormProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const referralCode = normalizeReferralCode(initialReferralCode) || '';
  const hasReferral = Boolean(referralCode);

  useEffect(() => {
    if (referralCode) stashReferralCode(referralCode);
  }, [referralCode]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      isAdult: undefined,
      acceptTerms: undefined,
      acceptPrivacy: undefined,
      acceptResearchNotice: undefined,
      referralCode,
    },
  });

  const referralCodeValue = watch('referralCode');
  useEffect(() => {
    stashReferralCode(referralCodeValue);
  }, [referralCodeValue]);

  const finishSignUp = async () => {
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
    onSuccess?.();
  };

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
      await finishSignUp();
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

      stashReferralCode(referralCodeValue || referralCode);
      const signedIn = await authService.signInWithGoogle();
      if (!signedIn) return;
      setUser(signedIn);

      const auth = getFirebaseAuth();
      await auth?.authStateReady();
      await auth?.currentUser?.getIdToken(true);

      setGoogleLoading(false);
      onSuccess?.();
    } catch (err) {
      console.error('[PepGuide auth] Google sign-in UI error', err);
      setError(getAuthErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  const acceptAllAgreements = () => {
    setValue('isAdult', true, { shouldValidate: true });
    setValue('acceptTerms', true, { shouldValidate: true });
    setValue('acceptPrivacy', true, { shouldValidate: true });
    setValue('acceptResearchNotice', true, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <GoogleAuthButton
        loading={googleLoading}
        onClick={() => void onGoogle()}
      />

      <AuthFormDivider />

      <div className="auth-form__section">
        <p className="auth-form__section-title">Your account</p>
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
        <div className="auth-form__grid-2">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="8+ chars, letter & number"
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
        </div>
      </div>

      <details className="auth-form__referral" open={hasReferral}>
        <summary>
          {hasReferral ? 'Referral code applied' : 'Have a referral code?'}
        </summary>
        <div className="auth-form__referral-body">
          <Input
            label="Referral code"
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="Optional"
            hint="From a PepGuide affiliate"
            error={errors.referralCode?.message}
            {...register('referralCode')}
          />
        </div>
      </details>

      <div className="auth-form__agreements">
        <div className="auth-form__agreements-top">
          <p className="auth-form__agreements-head">Required agreements</p>
          <button
            type="button"
            className="auth-form__accept-all"
            onClick={acceptAllAgreements}
          >
            Accept all
          </button>
        </div>
        <Controller
          name="isAdult"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="signup-is-adult"
              className="auth-check--compact"
              label="I am at least 18 years old"
              checked={field.value === true}
              onChange={(event) =>
                field.onChange(event.target.checked ? true : undefined)
              }
            />
          )}
        />
        {errors.isAdult ? (
          <p className="px-3 pb-1 text-sm text-critical">
            {errors.isAdult.message}
          </p>
        ) : null}

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="signup-accept-terms"
              className="auth-check--compact"
              label={
                <>
                  I accept the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="auth-form__legal-link"
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
          <p className="px-3 pb-1 text-sm text-critical">
            {errors.acceptTerms.message}
          </p>
        ) : null}

        <Controller
          name="acceptPrivacy"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="signup-accept-privacy"
              className="auth-check--compact"
              label={
                <>
                  I accept the{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="auth-form__legal-link"
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
          <p className="px-3 pb-1 text-sm text-critical">
            {errors.acceptPrivacy.message}
          </p>
        ) : null}

        <Controller
          name="acceptResearchNotice"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="signup-accept-research"
              className="auth-check--compact"
              label="Research-use acknowledgment"
              description={BRAND.researchAcknowledgment}
              checked={field.value === true}
              onChange={(event) =>
                field.onChange(event.target.checked ? true : undefined)
              }
            />
          )}
        />
        {errors.acceptResearchNotice ? (
          <p className="px-3 pb-2 text-sm text-critical">
            {errors.acceptResearchNotice.message}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      <div className="auth-form__submit">
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create account
        </Button>
      </div>
    </form>
  );
}
