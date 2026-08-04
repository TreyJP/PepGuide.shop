'use client';

import { useEffect, useState } from 'react';

import { isEnvAdminEmail } from '@/src/lib/admin';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { partnersRepository } from '@/src/services/firestore/partners';
import { useAuthStore } from '@/src/stores/auth-store';

export type AdminAccessState = {
  loading: boolean;
  isAdmin: boolean;
  reason: 'claim' | 'env' | 'allowlist' | null;
};

export function useAdminAccess(): AdminAccessState {
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const [state, setState] = useState<AdminAccessState>({
    loading: true,
    isAdmin: false,
    reason: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (initializing) {
        setState({ loading: true, isAdmin: false, reason: null });
        return;
      }

      if (!user?.email) {
        if (!cancelled) {
          setState({ loading: false, isAdmin: false, reason: null });
        }
        return;
      }

      const email = user.email.toLowerCase();

      if (isEnvAdminEmail(email)) {
        if (!cancelled) {
          setState({ loading: false, isAdmin: true, reason: 'env' });
        }
        return;
      }

      try {
        const auth = getFirebaseAuth();
        const token = await auth?.currentUser?.getIdTokenResult(true);
        if (token?.claims?.admin === true) {
          if (!cancelled) {
            setState({ loading: false, isAdmin: true, reason: 'claim' });
          }
          return;
        }
      } catch {
        // fall through to allowlist
      }

      try {
        const allowlisted = await partnersRepository.isAllowlistedAdmin(email);
        if (!cancelled) {
          setState({
            loading: false,
            isAdmin: allowlisted,
            reason: allowlisted ? 'allowlist' : null,
          });
        }
      } catch {
        if (!cancelled) {
          setState({ loading: false, isAdmin: false, reason: null });
        }
      }
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [user?.email, initializing]);

  return state;
}
