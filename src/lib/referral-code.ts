const STORAGE_KEY = 'pepguide_referral_code';

/** Normalize affiliate codes for storage / lookup. */
export function normalizeReferralCode(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

export function stashReferralCode(code: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeReferralCode(code);
  if (!normalized) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, normalized);
}

/** Read + clear a pending referral code (Google / delayed profile create). */
export function consumeReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  const value = normalizeReferralCode(window.sessionStorage.getItem(STORAGE_KEY));
  window.sessionStorage.removeItem(STORAGE_KEY);
  return value || null;
}

export function peekReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return normalizeReferralCode(window.sessionStorage.getItem(STORAGE_KEY)) || null;
}
