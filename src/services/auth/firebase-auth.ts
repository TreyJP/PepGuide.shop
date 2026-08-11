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
    chatCount: 0,
    researchInterests: [],
    experienceLevel: null,
    researchPreferences: [],
    acceptedTermsVersion: BRAND.termsVersion,
    acceptedPrivacyVersion: BRAND.privacyVersion,
    acceptedResearchNoticeVersion: BRAND.researchNoticeVersion,
    dataRetentionDays: 365,
    referredByCode: null,
    referredByAffiliateId: null,
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

    // Resolve Google redirect in the background — never block auth hydration on it.
    // Awaiting getRedirectResult before onAuthStateChanged can leave the app stuck
    // on "Loading PepGuide…" after a successful login.
    void getRedirectResult(auth).catch((error) => {
      console.error('Google redirect sign-in failed', error);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const current = ++generation;
      void (async () => {
        if (!firebaseUser) {
          if (current === generation) listener(null);
          return;
        }

        // Don't let a slow Firestore profile sync hang the whole app shell.
        let timedOut = false;
        const profile = await Promise.race([
          toProfile(firebaseUser),
          new Promise<UserProfile>((resolve) => {
            setTimeout(() => {
              timedOut = true;
              resolve(fallbackProfile(firebaseUser));
            }, 4000);
          }),
        ]);

        if (current === generation) listener(profile);

        // If we raced with the fallback, still try to sync the real profile.
        if (timedOut) {
          void toProfile(firebaseUser)
            .then((synced) => {
              if (current === generation) listener(synced);
            })
            .catch(() => undefined);
        }
      })();
    });

    return () => {
      unsubscribeAuth();
    };
  },

  async signIn(input: SignInInput): Promise<UserProfile> {
    const auth = requireAuth();
    await auth.authStateReady();
    const credential = await signInWithEmailAndPassword(
      auth,
      input.email,
      input.password,
    );
    // Force a fresh ID token so chat API works immediately on mobile.
    await credential.user.getIdToken(true);
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
      // best-effort
    }
    await credential.user.getIdToken(true);
    try {
      return await userRepository.ensureProfile({
        id: credential.user.uid,
        displayName: input.displayName,
        email: input.email,
        photoURL: credential.user.photoURL,
        emailVerified: credential.user.emailVerified,
        referralCode: input.referralCode,
      });
    } catch (error) {
      console.error('Failed to sync user profile; using auth fallback', error);
      return fallbackProfile(credential.user);
    }
  },

  async signInWithGoogle(): Promise<UserProfile | null> {
    if (isInAppBrowser()) {
      throw new Error(
        `Google sign-in can’t finish inside ${inAppBrowserName()}. Open PepGuide in Safari or Chrome (⋯ → Open in browser), then try again.`,
      );
    }

    const auth = requireAuth();
    await auth.authStateReady();

    // Already signed in (including after a prior Google redirect) — don't re-prompt.
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      return toProfile(auth.currentUser);
    }

    const provider = new GoogleAuthProvider();
    // Do not set prompt=select_account — that forces Google's chooser every time
    // even when the user already has an active Google session.

    try {
      // Popup keeps context; COOP header same-origin-allow-popups helps on modern browsers.
      const credential = await signInWithPopup(auth, provider);
      await credential.user.getIdToken(true);
      return toProfile(credential.user);
    } catch (error) {
      const code =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string'
          ? (error as { code: string }).code
          : '';

      console.error('[PepGuide auth] Google popup failed', code, error);

      // Don't redirect-loop on cancel / domain misconfig — surface those.
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/unauthorized-domain' ||
        code === 'auth/operation-not-allowed' ||
        code === 'auth/account-exists-with-different-credential'
      ) {
        throw error;
      }

      // Popup blocked / COOP / flaky mobile → full-page redirect.
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/internal-error' ||
        code === 'auth/network-request-failed' ||
        !code
      ) {
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
    await user.delete();
  },
};
