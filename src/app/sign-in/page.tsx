'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AuthLayout } from '@/src/components/auth/auth-layout';
import { SignInForm } from '@/src/components/auth/sign-in-form';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

export default function SignInPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const openSignUpModal = useUiStore((state) => state.openSignUpModal);

  useEffect(() => {
    if (!initializing && user) {
      router.replace('/chat');
    }
  }, [initializing, user, router]);

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue your peptide research."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="font-medium text-accent hover:underline"
            onClick={() => openSignUpModal()}
          >
            Create one
          </button>
        </>
      }
    >
      <SignInForm onSuccess={() => router.replace('/chat')} />
    </AuthLayout>
  );
}
