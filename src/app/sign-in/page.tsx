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
      const user = await authService.signIn(values);
      setUser(user);
      router.push('/chat');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const signedIn = await authService.signInWithGoogle();
      // null = mobile redirect in progress (page will unload / come back).
      if (!signedIn) return;
      setUser(signedIn);
      router.push('/chat');
    } catch (err) {
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
