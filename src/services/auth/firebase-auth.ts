import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import type { SignInInput, SignUpInput } from '@/src/schemas/auth';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { userRepository } from '@/src/services/firestore/users';
import type { UserProfile } from '@/src/types';

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured');
  return auth;
}

async function toProfile(user: User): Promise<UserProfile> {
  return userRepository.ensureProfile({
    id: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Researcher',
    email: user.email ?? '',
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  });
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

    return onAuthStateChanged(auth, (firebaseUser) => {
      void (async () => {
        if (!firebaseUser) {
          listener(null);
          return;
        }
        try {
          const profile = await toProfile(firebaseUser);
          listener(profile);
        } catch (error) {
          console.error('Failed to load user profile', error);
          listener(null);
        }
      })();
    });
  },

  async signIn(input: SignInInput): Promise<UserProfile> {
    const credential = await signInWithEmailAndPassword(
      requireAuth(),
      input.email,
      input.password,
    );
    return toProfile(credential.user);
  },

  async signUp(input: SignUpInput): Promise<UserProfile> {
    const credential = await createUserWithEmailAndPassword(
      requireAuth(),
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

  async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(requireAuth(), provider);
    return toProfile(credential.user);
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
    const current = requireAuth().currentUser;
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
    // Prefer Cloud Function for cascading deletes in production.
    await user.delete();
  },
};
