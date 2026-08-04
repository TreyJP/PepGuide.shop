'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BRAND } from '@/src/constants/brand';
import { authService } from '@/src/services/auth';
import { useAuthStore } from '@/src/stores/auth-store';

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setMounted(true), []);

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

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b border-border px-6 py-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Manage your profile, appearance, and privacy.
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
              {user?.displayName}
            </p>
            <p>
              <span className="text-foreground-secondary">Email: </span>
              {user?.email}
            </p>
            <p>
              <span className="text-foreground-secondary">Access: </span>
              Free for everyone
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose light or dark theme</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {mounted ? (
              ['light', 'dark', 'system'].map((option) => (
                <Button
                  key={option}
                  variant={theme === option ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))
            ) : (
              <p className="text-sm text-foreground-secondary">Loading theme…</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>{BRAND.notice}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground-secondary">
              Data retention: {user?.dataRetentionDays ?? 365} days
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

