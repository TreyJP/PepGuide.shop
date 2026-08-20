import { createHash, randomBytes } from 'crypto';

import {
  normalizeCampaignReferralCode,
  slugifyCampaignName,
} from '@/src/lib/campaigns/codes-shared';

export {
  normalizeCampaignReferralCode,
  isCampaignReferralCode,
  slugifyCampaignName,
} from '@/src/lib/campaigns/codes-shared';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generate a hard-to-guess campaign referral code like PG-X7K92M. */
export function generateCampaignReferralCode(): string {
  const bytes = randomBytes(6);
  let body = '';
  for (let i = 0; i < 6; i += 1) {
    body += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return `PG-${body}`;
}

export function hashIdentifier(value: string, salt = 'pepguide-campaigns'): string {
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function createVisitorId(): string {
  return `v_${randomBytes(16).toString('hex')}`;
}

void normalizeCampaignReferralCode;
void slugifyCampaignName;
