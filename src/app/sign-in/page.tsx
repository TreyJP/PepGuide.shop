'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthLayout } from '@/src/components/auth/auth-layout';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { getAuthErrorMessage } from '@/src/lib/firebase-errors';
import { signInSchema, type SignInInput } from '@/src/schemas/auth';
import { authService } from '@/src/services/auth';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';

export default function SignInPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Mobile Google redirect returns here — send signed-in users into chat.
  useEffect(() => {
    if (!initializing && user) {
      router.replace('/chat');
    }
  }, [initializing, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

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

      // Ensure Firebase session + ID token exist before entering chat (critical on mobile).
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

      const signedIn = await authService.signInWithGoogle();
      // null = redirect in progress (page will unload / come back).
      if (!signedIn) return;
      setUser(signedIn);

      const auth = getFirebaseAuth();
      await auth?.authStateReady();
      await auth?.currentUser?.getIdToken(true);

      router.replace('/chat');
    } catch (err) {
      console.error('[PepGuide auth] Google sign-in UI error', err);
      setError(getAuthErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue your peptide research."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-accent hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            href="/forgot-password"
            className="text-sm text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error ? <p className="text-sm text-critical">{error}</p> : null}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
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
