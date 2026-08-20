const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function normalizeCampaignReferralCode(
  value: string | null | undefined,
): string {
  return (value ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

export function isCampaignReferralCode(value: string | null | undefined): boolean {
  const code = normalizeCampaignReferralCode(value);
  return /^PG-[A-Z0-9]{6}$/.test(code);
}

export function slugifyCampaignName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/** Browser-safe random code (server uses crypto in codes-server.ts). */
export function generateCampaignReferralCodeBrowser(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let body = '';
  for (let i = 0; i < 6; i += 1) {
    body += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return `PG-${body}`;
}
