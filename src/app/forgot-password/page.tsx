'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AuthLayout } from '@/src/components/auth/auth-layout';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/src/schemas/auth';
import { authService } from '@/src/services/auth';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setError(null);
    try {
      await authService.sendPasswordReset(values.email);
      setSent(true);
    } catch {
      setError('Unable to send reset email. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we'll send reset instructions."
      footer={
        <Link href="/sign-in" className="font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm leading-relaxed text-foreground-secondary">
          If an account exists for that email, password reset instructions have been sent.
          Check your inbox and follow the link to choose a new password.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          {error ? <p className="text-sm text-critical">{error}</p> : null}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
