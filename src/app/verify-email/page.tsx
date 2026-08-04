'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthLayout } from '@/src/components/auth/auth-layout';
import { Button } from '@/src/components/ui/button';
import { getAuthErrorMessage } from '@/src/lib/firebase-errors';
import { authService } from '@/src/services/auth';
import { useAuthStore } from '@/src/stores/auth-store';

export default function VerifyEmailPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.sendEmailVerification();
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      description={
        user
          ? `We sent a verification link to ${user.email}. You can continue researching now and verify later.`
          : 'Sign in to manage email verification.'
      }
      footer={
        <Link href="/chat" className="font-medium text-accent hover:underline">
          Continue to PepGuide
        </Link>
      }
    >
      <div className="space-y-3">
        {error ? <p className="text-sm text-critical">{error}</p> : null}
        {sent ? (
          <p className="text-sm text-success">Verification email sent.</p>
        ) : null}
        <Button
          className="w-full"
          loading={loading}
          onClick={() => void handleResend()}
        >
          Resend verification email
        </Button>
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => router.push('/chat')}
        >
          Continue to chat
        </Button>
      </div>
    </AuthLayout>
  );
}
