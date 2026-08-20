/** Creator vanity handles for memorable campaign links (?ref=rylan, /ref/rylan). */

const RESERVED = new Set([
  'admin',
  'api',
  'app',
  'campaign',
  'campaigns',
  'chat',
  'dashboard',
  'help',
  'login',
  'pepguide',
  'privacy',
  'pro',
  'r',
  'ref',
  'referral',
  'settings',
  'sign-in',
  'sign-up',
  'signin',
  'signup',
  'support',
  'terms',
  'www',
]);

export function normalizeVanityHandle(
  value: string | null | undefined,
): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 24);
}

export function isValidVanityHandle(value: string | null | undefined): boolean {
  const handle = normalizeVanityHandle(value);
  if (handle.length < 3 || handle.length > 24) return false;
  if (!/^[a-z][a-z0-9_-]*$/.test(handle)) return false;
  if (handle.startsWith('pg-')) return false;
  if (RESERVED.has(handle)) return false;
  return true;
}

/** Accepts either PG-XXXXXX or a vanity handle like rylan. */
export function normalizeCampaignRef(
  value: string | null | undefined,
): string {
  const raw = (value ?? '').trim();
  if (!raw) return '';
  const upper = raw.toUpperCase().replace(/\s+/g, '');
  if (/^PG-[A-Z0-9]{6}$/.test(upper)) return upper;
  return normalizeVanityHandle(raw);
}

export function isResolvableCampaignRef(
  value: string | null | undefined,
): boolean {
  const normalized = normalizeCampaignRef(value);
  if (!normalized) return false;
  if (/^PG-[A-Z0-9]{6}$/.test(normalized)) return true;
  return isValidVanityHandle(normalized);
}
