'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import '@/src/components/auth/auth-forms.css';
import {
  AuthFormDivider,
  GoogleAuthButton,
} from '@/src/components/auth/google-auth-button';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { attachCampaignSignup } from '@/src/lib/campaigns/client-attribution';
import { getAuthErrorMessage } from '@/src/lib/firebase-errors';
import { signInSchema, type SignInInput } from '@/src/schemas/auth';
import { authService } from '@/src/services/auth';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';

export type SignInFormProps = {
  onSuccess?: () => void;
  forgotPasswordHref?: string;
};

export function SignInForm({
  onSuccess,
  forgotPasswordHref = '/forgot-password',
}: SignInFormProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const finishSignIn = async () => {
    const auth = getFirebaseAuth();
    await auth?.authStateReady();
    const firebaseUser = auth?.currentUser;
    if (!firebaseUser) {
      setError(
        'Signed in, but the secure session didn’t finish loading. Please try again.',
      );
      return;
    }
    await firebaseUser.getIdToken(true);
    try {
      await attachCampaignSignup({
        idToken: await firebaseUser.getIdToken(),
        email: firebaseUser.email ?? undefined,
        emailVerified: firebaseUser.emailVerified,
      });
    } catch {
      // best-effort
    }
    onSuccess?.();
  };

  const onSubmit = async (values: SignInInput) => {
    setError(null);
    try {
      if (authService.isMockMode()) {
        setError(
          'This site is in mock mode, so email sign-in can’t unlock chat. Set NEXT_PUBLIC_USE_MOCK_SERVICES=false on Vercel and redeploy.',
        );
        return;
      }

      const signedIn = await authService.signIn(values);
      setUser(signedIn);
      await finishSignIn();
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

      const signedIn = await authService.signInWithGoogle();
      if (!signedIn) return;
      setUser(signedIn);

      const auth = getFirebaseAuth();
      await auth?.authStateReady();
      await auth?.currentUser?.getIdToken(true);
      try {
        const token = await auth?.currentUser?.getIdToken();
        if (token) {
          await attachCampaignSignup({
            idToken: token,
            email: auth?.currentUser?.email ?? undefined,
            emailVerified: auth?.currentUser?.emailVerified,
          });
        }
      } catch {
        // best-effort
      }

      setGoogleLoading(false);
      onSuccess?.();
    } catch (err) {
      console.error('[PepGuide auth] Google sign-in UI error', err);
      setError(getAuthErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <GoogleAuthButton
        loading={googleLoading}
        onClick={() => void onGoogle()}
      />

      <AuthFormDivider />

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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="text-right">
        <Link
          href={forgotPasswordHref}
          className="text-sm text-accent hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
