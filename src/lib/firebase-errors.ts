export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';

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
      return 'Google sign-in was cancelled.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Auth settings.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is disabled in the Firebase console.';
    case 'permission-denied':
      return 'Firestore permission denied. Deploy security rules and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
