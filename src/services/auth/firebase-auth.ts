import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import { BRAND } from '@/src/constants/brand';
import { inAppBrowserName, isInAppBrowser } from '@/src/lib/in-app-browser';
import type { SignInInput, SignUpInput } from '@/src/schemas/auth';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { userRepository } from '@/src/services/firestore/users';
import type { UserProfile } from '@/src/types';

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured');
  return auth;
}

function fallbackProfile(user: User): UserProfile {
  const now = new Date().toISOString();
  return {
    id: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Researcher',
    email: user.email ?? '',
    photoURL: user.photoURL,
    createdAt: now,
    onboardingCompleted: true,
    emailVerified: user.emailVerified,
    subscriptionTier: 'free',
    accountStatus: 'active',
    chatBlockedUntil: null,
    abuseStrikeCount: 0,
    researchInterests: [],
    experienceLevel: null,
    researchPreferences: [],
    acceptedTermsVersion: BRAND.termsVersion,
    acceptedPrivacyVersion: BRAND.privacyVersion,
    acceptedResearchNoticeVersion: BRAND.researchNoticeVersion,
    dataRetentionDays: 365,
  };
}

async function toProfile(user: User): Promise<UserProfile> {
  try {
    return await userRepository.ensureProfile({
      id: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Researcher',
      email: user.email ?? '',
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    // Keep the session usable even if Firestore profile sync is slow/offline.
    console.error('Failed to sync user profile; using auth fallback', error);
    return fallbackProfile(user);
  }
}

export const firebaseAuthService = {
  getCurrentUser(): UserProfile | null {
    return null;
  },

  subscribe(listener: (user: UserProfile | null) => void) {
    const auth = getFirebaseAuth();
    if (!auth) {
      listener(null);
      return () => undefined;
    }

    let generation = 0;

    // Complete Google redirect sign-in (common on mobile) before listening.
    void getRedirectResult(auth).catch((error) => {
      console.error('Google redirect sign-in failed', error);
    });

    return onAuthStateChanged(auth, (firebaseUser) => {
      const current = ++generation;
      void (async () => {
        if (!firebaseUser) {
          if (current === generation) listener(null);
          return;
        }
        const profile = await toProfile(firebaseUser);
        if (current === generation) listener(profile);
      })();
    });
  },

  async signIn(input: SignInInput): Promise<UserProfile> {
    const auth = requireAuth();
    await auth.authStateReady();
    const credential = await signInWithEmailAndPassword(
      auth,
      input.email,
      input.password,
    );
    return toProfile(credential.user);
  },

  async signUp(input: SignUpInput): Promise<UserProfile> {
    const auth = requireAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email,
      input.password,
    );
    await updateProfile(credential.user, { displayName: input.displayName });
    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Verification email is best-effort in early setup.
    }
    return toProfile(credential.user);
  },

  async signInWithGoogle(): Promise<UserProfile | null> {
    if (isInAppBrowser()) {
      throw new Error(
        `Google sign-in can’t finish inside ${inAppBrowserName()}. Open PepGuide in Safari or Chrome, then try again.`,
      );
    }

    const auth = requireAuth();
    await auth.authStateReady();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Prefer popup in Safari/iOS. If the popup is blocked, fall back to redirect
    // (same-origin `/__/auth` proxy in next.config makes that Safari-safe).
    try {
      const credential = await signInWithPopup(auth, provider);
      return toProfile(credential.user);
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : '';

      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
        return null;
      }

      throw error;
    }
  },

  async signInWithApple(): Promise<UserProfile> {
    throw new Error('Apple sign-in is not enabled for the web app yet.');
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(requireAuth(), email);
  },

  async sendEmailVerification(): Promise<void> {
    const user = requireAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    await sendEmailVerification(user);
  },

  async restoreSession(_user: UserProfile): Promise<UserProfile> {
    const auth = requireAuth();
    await auth.authStateReady();
    const current = auth.currentUser;
    if (!current) throw new Error('No Firebase session to restore');
    return toProfile(current);
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(requireAuth());
  },

  async updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
    const user = requireAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    if (patch.displayName) {
      await updateProfile(user, { displayName: patch.displayName });
    }
    return userRepository.updateProfile(user.uid, patch);
  },

  async deleteAccount(): Promise<void> {
    const user = requireAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    // Prefer custom backend for cascading deletes in production.
    await user.delete();
  },
};
