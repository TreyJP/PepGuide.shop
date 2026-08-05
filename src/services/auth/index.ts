import type { SignInInput, SignUpInput } from '@/src/schemas/auth';
import type { UserProfile } from '@/src/types';

import { shouldUseMockServices } from '../firebase/config';
import { firebaseAuthService } from './firebase-auth';
import { mockAuthService } from './mock-auth';

function activeAuth() {
  return shouldUseMockServices() ? mockAuthService : firebaseAuthService;
}

export const authService = {
  getCurrentUser(): UserProfile | null {
    return activeAuth().getCurrentUser();
  },
  subscribe(listener: (user: UserProfile | null) => void) {
    return activeAuth().subscribe(listener);
  },
  signIn(input: SignInInput) {
    return activeAuth().signIn(input);
  },
  signUp(input: SignUpInput) {
    return activeAuth().signUp(input);
  },
  signInWithGoogle(): Promise<UserProfile | null> {
    return activeAuth().signInWithGoogle();
  },
  signInWithApple() {
    return activeAuth().signInWithApple();
  },
  sendPasswordReset(email: string) {
    return activeAuth().sendPasswordReset(email);
  },
  sendEmailVerification() {
    return activeAuth().sendEmailVerification();
  },
  restoreSession(user: UserProfile) {
    if (shouldUseMockServices()) {
      return mockAuthService.restoreSession(user);
    }
    // Firebase restores via onAuthStateChanged; ignore persisted mock snapshots.
    return Promise.resolve(user);
  },
  signOut() {
    return activeAuth().signOut();
  },
  updateProfile(patch: Partial<UserProfile>) {
    return activeAuth().updateProfile(patch);
  },
  deleteAccount() {
    return activeAuth().deleteAccount();
  },
  isMockMode() {
    return shouldUseMockServices();
  },
};
