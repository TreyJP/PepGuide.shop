function readErrorField(
  error: unknown,
  key: 'code' | 'message',
): string {
  if (typeof error !== 'object' || error === null || !(key in error)) {
    return '';
  }
  const value = (error as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

export function getAuthErrorMessage(error: unknown): string {
  const code = readErrorField(error, 'code');
  const message = readErrorField(error, 'message');
  const plain =
    error instanceof Error && error.message ? error.message : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Allow popups for this site, or try again.';
    case 'auth/unauthorized-domain': {
      const host =
        typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `“${host}” is not an authorized domain in Firebase Auth. Add it under Firebase Console → Authentication → Settings → Authorized domains (include localhost, pepguide.shop, www.pepguide.shop, and your Vercel domain).`;
    }
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled in the Firebase console. Enable the Google provider under Authentication → Sign-in method.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method. Sign in with email/password instead.';
    case 'auth/network-request-failed':
      return 'Network error during sign-in. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Wait a moment and try again.';
    case 'auth/internal-error':
      return 'Google sign-in hit an internal error. Try again, or use email sign-in.';
    case 'auth/invalid-api-key':
      return 'Firebase API key is invalid. Check NEXT_PUBLIC_FIREBASE_API_KEY on this deployment.';
    case 'auth/configuration-not-found':
      return 'Firebase Auth is not configured for this project. Enable Authentication in the Firebase console.';
    case 'auth/argument-error':
      return 'Google sign-in isn’t set up correctly in this browser session. Hard-refresh the page and try again. If it persists, confirm Google is enabled in Firebase Authentication.';
    case 'permission-denied':
      return 'Firestore permission denied. Deploy security rules and try again.';
    default:
      break;
  }

  if (plain && !plain.toLowerCase().includes('firebase')) {
    return plain;
  }

  if (plain) return plain;

  if (code) {
    return `Sign-in failed (${code}). ${message || 'Please try again.'}`;
  }

  return message || 'Something went wrong. Please try again.';
}
