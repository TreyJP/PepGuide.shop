'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import '@/src/components/settings/settings-designs.css';
import { SetDesignAtlas } from '@/src/components/settings/designs/set-design-atlas';
import { BRAND } from '@/src/constants/brand';
import { PRO_COMING_SOON } from '@/src/constants/billing';
import { authService } from '@/src/services/auth';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

export function SettingsWorkspace() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const setUser = useAuthStore((state) => state.setUser);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );
  const [deleting, setDeleting] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

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

  const handleManageBilling = async () => {
    setBillingBusy(true);
    setBillingError(null);
    try {
      const token = await getFirebaseAuth()?.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Sign in again to manage billing.');
      }
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Unable to open billing portal.');
      }
      window.location.href = data.url;
    } catch (error) {
      setBillingError(
        error instanceof Error ? error.message : 'Unable to open billing portal.',
      );
      setBillingBusy(false);
    }
  };

  if (initializing) {
    return (
      <div className="set-root">
        <div className="set-gate">
          <div className="set-gate__spin">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="set-root">
        <div className="set-gate">
          <h1>Settings</h1>
          <p>Sign in to manage your profile and privacy settings.</p>
          <button
            type="button"
            className="set-btn set-btn--navy"
            onClick={() =>
              openSignInModal('Sign in to manage your PepGuide settings.')
            }
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="set-root">
      <div className="set-scroll">
        <SetDesignAtlas
          user={user}
          notice={BRAND.notice}
          deleting={deleting}
          billingBusy={billingBusy}
          billingError={billingError}
          proComingSoon={PRO_COMING_SOON}
          onSignOut={() => void handleSignOut()}
          onDeleteAccount={() => void handleDeleteAccount()}
          onSubscribePro={() => openProSubscribeModal('PepGuide Pro')}
          onManageBilling={() => void handleManageBilling()}
        />
      </div>
    </div>
  );
}
