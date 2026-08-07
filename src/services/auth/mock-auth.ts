import { BRAND } from '@/src/constants/brand';
import type { SignInInput, SignUpInput } from '@/src/schemas/auth';
import type { UserProfile } from '@/src/types';
import { createId } from '@/src/utils/dates';

let currentUser: UserProfile | null = null;
const listeners = new Set<(user: UserProfile | null) => void>();

function notify() {
  listeners.forEach((listener) => listener(currentUser));
}

function createMockUser(
  input: Pick<UserProfile, 'displayName' | 'email'> & {
    onboardingCompleted?: boolean;
  },
): UserProfile {
  return {
    id: createId('user'),
    displayName: input.displayName,
    email: input.email,
    photoURL: null,
    createdAt: new Date().toISOString(),
    onboardingCompleted: input.onboardingCompleted ?? true,
    emailVerified: true,
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
  };
}

export const mockAuthService = {
  getCurrentUser(): UserProfile | null {
    return currentUser;
  },
  subscribe(listener: (user: UserProfile | null) => void) {
    listeners.add(listener);
    listener(currentUser);
    return () => {
      listeners.delete(listener);
    };
  },

  async signIn(input: SignInInput): Promise<UserProfile> {
    currentUser = createMockUser({
      displayName: input.email.split('@')[0] || 'Researcher',
      email: input.email,
      onboardingCompleted: true,
    });
    notify();
    return currentUser;
  },
  async signUp(input: SignUpInput): Promise<UserProfile> {
    currentUser = createMockUser({
      displayName: input.displayName,
      email: input.email,
      onboardingCompleted: true,
    });
    notify();
    return currentUser;
  },
  async signInWithGoogle(): Promise<UserProfile | null> {
    currentUser = createMockUser({
      displayName: 'Google Researcher',
      email: 'researcher@gmail.com',
      onboardingCompleted: true,
    });
    notify();
    return currentUser;
  },
  async signInWithApple(): Promise<UserProfile> {
    currentUser = createMockUser({
      displayName: 'Apple Researcher',
      email: 'researcher@privaterelay.appleid.com',
      onboardingCompleted: true,
    });
    notify();
    return currentUser;
  },

  async sendPasswordReset(_email: string): Promise<void> {
    return;
  },
  async sendEmailVerification(): Promise<void> {
    return;
  },
  async restoreSession(user: UserProfile): Promise<UserProfile> {
    currentUser = user;
    notify();
    return currentUser;
  },
  async signOut(): Promise<void> {
    currentUser = null;
    notify();
  },
  async updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    currentUser = { ...currentUser, ...patch };
    notify();
    return currentUser;
  },
  async deleteAccount(): Promise<void> {
    currentUser = null;
    notify();
  },
};
