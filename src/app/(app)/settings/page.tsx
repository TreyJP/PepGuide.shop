'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { BRAND } from '@/src/constants/brand';
import { authService } from '@/src/services/auth';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const setUser = useAuthStore((state) => state.setUser);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      openSignInModal('Sign in to manage your PepGuide settings.');
    }
  }, [initializing, user, openSignInModal]);

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    router.push('/sign-in');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account and research data? This cannot be undone.',
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await authService.deleteAccount();
      setUser(null);
      router.push('/');
    } finally {
      setDeleting(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Settings
        </h1>
        <p className="max-w-md text-sm text-foreground-secondary">
          Sign in to manage your profile and privacy settings.
        </p>
        <Button
          onClick={() =>
            openSignInModal('Sign in to manage your PepGuide settings.')
          }
        >
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Manage your profile and privacy.
        </p>
      </header>

      <div className="mx-auto grid max-w-3xl gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-foreground-secondary">Name: </span>
              {user.displayName}
            </p>
            <p>
              <span className="text-foreground-secondary">Email: </span>
              {user.email}
            </p>
            <p>
              <span className="text-foreground-secondary">Access: </span>
              {user.subscriptionTier === 'pro' ? 'PepGuide Pro' : 'Free'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>{BRAND.notice}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground-secondary">
              Data retention: {user.dataRetentionDays ?? 365} days
            </p>
            <Button
              variant="destructive"
              loading={deleting}
              onClick={() => void handleDeleteAccount()}
            >
              Delete account
            </Button>
          </CardContent>
        </Card>

        <Button variant="ghost" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
