import type { CampaignQualificationRules } from '@/src/types/campaigns';
import { DEFAULT_QUALIFICATION_RULES } from '@/src/constants/campaigns';

export type FraudSignalInput = {
  email: string | null;
  emailVerified: boolean;
  referredUserId: string;
  participantUserId: string;
  hashedNetworkId: string | null;
  deviceHash: string | null;
  /** Count of accounts sharing this network hash in the campaign. */
  networkAccountCount: number;
  /** Count of accounts sharing this device hash in the campaign. */
  deviceAccountCount: number;
  /** Signups from this participant in the last hour. */
  participantHourlySignups: number;
  /** Signups from this network in the last hour. */
  networkHourlySignups: number;
  userAgent: string | null;
  isDatacenterOrProxyHint: boolean;
  accountAgeHours: number;
  sessionCount: number;
  meaningfulActionCount: number;
};

export type FraudAssessment = {
  score: number;
  signals: string[];
  /** Suggested status after scoring (before qualification timers). */
  suggestedStatus: 'pending' | 'fraud_review' | 'rejected';
};

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'sharklasers.com',
  'discard.email',
  'throwaway.email',
]);

function emailDomain(email: string | null): string | null {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[1]?.trim().toLowerCase() ?? null;
}

function relatedEmails(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  if (left === right) return true;
  const [la, da] = left.split('@');
  const [lb, db] = right.split('@');
  if (!la || !lb || !da || !db || da !== db) return false;
  const normalizeLocal = (local: string) =>
    local.replace(/\./g, '').replace(/\+.*$/, '');
  return normalizeLocal(la) === normalizeLocal(lb);
}

/**
 * Multi-signal fraud scoring. Exact thresholds are server-only and not
 * exposed to participants. Combines signals rather than banning on one hit.
 */
export function scoreReferralFraud(input: FraudSignalInput): FraudAssessment {
  let score = 0;
  const signals: string[] = [];

  if (input.referredUserId === input.participantUserId) {
    score += 100;
    signals.push('self_referral_same_account');
  }

  if (relatedEmails(input.email, null)) {
    // no-op placeholder — participant email compared separately by caller
  }

  const domain = emailDomain(input.email);
  if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    score += 45;
    signals.push('disposable_email');
  }

  if (!input.emailVerified) {
    score += 15;
    signals.push('email_unverified');
  }

  if (input.deviceAccountCount >= 3) {
    score += 35;
    signals.push('device_cluster');
  } else if (input.deviceAccountCount >= 2) {
    score += 18;
    signals.push('shared_device');
  }

  if (input.networkAccountCount >= 5) {
    score += 30;
    signals.push('network_cluster');
  } else if (input.networkAccountCount >= 3) {
    score += 15;
    signals.push('shared_network');
  }

  if (input.participantHourlySignups >= 8) {
    score += 40;
    signals.push('participant_velocity');
  } else if (input.participantHourlySignups >= 4) {
    score += 20;
    signals.push('participant_burst');
  }

  if (input.networkHourlySignups >= 12) {
    score += 35;
    signals.push('network_velocity');
  }

  if (input.isDatacenterOrProxyHint) {
    score += 12;
    signals.push('proxy_or_datacenter_hint');
  }

  const ua = (input.userAgent ?? '').toLowerCase();
  if (!ua || ua.includes('bot') || ua.includes('spider') || ua.includes('crawl')) {
    score += 25;
    signals.push('suspicious_user_agent');
  }

  if (input.accountAgeHours < 1 && input.meaningfulActionCount === 0) {
    score += 10;
    signals.push('zero_engagement_new_account');
  }

  score = Math.min(100, Math.max(0, score));

  let suggestedStatus: FraudAssessment['suggestedStatus'] = 'pending';
  if (score >= DEFAULT_QUALIFICATION_RULES.veryHighRiskFloor) {
    suggestedStatus = 'rejected';
  } else if (score >= DEFAULT_QUALIFICATION_RULES.highRiskFloor) {
    suggestedStatus = 'fraud_review';
  }

  return { score, signals, suggestedStatus };
}

export function compareParticipantEmail(
  referredEmail: string | null,
  participantEmail: string | null,
  assessment: FraudAssessment,
): FraudAssessment {
  if (relatedEmails(referredEmail, participantEmail)) {
    const score = Math.min(100, assessment.score + 55);
    const signals = [...assessment.signals, 'related_email_to_participant'];
    let suggestedStatus = assessment.suggestedStatus;
    if (score >= DEFAULT_QUALIFICATION_RULES.veryHighRiskFloor) {
      suggestedStatus = 'rejected';
    } else if (score >= DEFAULT_QUALIFICATION_RULES.highRiskFloor) {
      suggestedStatus = 'fraud_review';
    }
    return { score, signals, suggestedStatus };
  }
  return assessment;
}

export function canAutoQualify(input: {
  rules: CampaignQualificationRules;
  emailVerified: boolean;
  accountAgeHours: number;
  sessionCount: number;
  meaningfulActionCount: number;
  fraudScore: number;
  suggestedStatus: FraudAssessment['suggestedStatus'];
}): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const { rules } = input;

  if (rules.emailVerified && !input.emailVerified) {
    reasons.push('email_not_verified');
  }
  if (input.accountAgeHours < rules.minimumAccountAgeHours) {
    reasons.push('account_too_new');
  }
  if (input.sessionCount < rules.minimumSessions) {
    reasons.push('insufficient_sessions');
  }
  if (input.meaningfulActionCount < rules.minimumMeaningfulActions) {
    reasons.push('insufficient_actions');
  }
  if (input.fraudScore > rules.maxAutoQualifyFraudScore) {
    reasons.push('fraud_score_above_auto_qualify');
  }
  if (input.suggestedStatus === 'fraud_review') {
    reasons.push('requires_fraud_review');
  }
  if (input.suggestedStatus === 'rejected') {
    reasons.push('auto_rejected_by_fraud');
  }
  if (rules.requireFraudApproval && input.fraudScore >= rules.highRiskFloor) {
    reasons.push('manual_approval_required');
  }

  return { ok: reasons.length === 0, reasons };
}

/** Lightweight datacenter/proxy UA + header heuristics (no external API required). */
export function detectProxyHint(input: {
  userAgent: string | null;
  forwardedFor: string | null;
}): boolean {
  const ua = (input.userAgent ?? '').toLowerCase();
  if (ua.includes('headless') || ua.includes('phantom')) return true;
  const xff = input.forwardedFor ?? '';
  // Multiple hops often indicate proxies; alone not decisive.
  if (xff.split(',').length >= 4) return true;
  return false;
}
