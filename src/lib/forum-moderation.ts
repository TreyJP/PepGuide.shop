/**
 * Client-side forum content checks for profanity and guideline-breaking posts.
 * Applied before create/update/reply writes.
 */

export type ForumModerationResult =
  | { ok: true }
  | { ok: false; reason: string };

const PROFANITY_PATTERNS: RegExp[] = [
  /\bf+u+c+k+(?:ing|ed|er|s)?\b/i,
  /\bs+h+i+t+(?:s|ty|ting)?\b/i,
  /\ba+s+s+h+o+l+e+s?\b/i,
  /\bb+i+t+c+h+(?:es|y)?\b/i,
  /\bc+u+n+t+s?\b/i,
  /\bd+i+c+k+(?:s|head)?\b/i,
  /\bp+u+s+s+y+\b/i,
  /\bc+o+c+k+(?:s|y)?\b/i,
  /\bw+h+o+r+e+s?\b/i,
  /\bs+l+u+t+s?\b/i,
  /\bb+a+s+t+a+r+d+s?\b/i,
  /\bn+i+g+(?:g+e+r|g+a)+s?\b/i,
  /\bf+a+g+(?:g+o+t|s)?\b/i,
  /\br+e+t+a+r+d+(?:ed|s)?\b/i,
  /\bk+y+k+e+s?\b/i,
  /\bsp+i+c+s?\b/i,
  /\bc+h+i+n+k+s?\b/i,
  /\bt+r+a+n+n+y+\b/i,
];

const INAPPROPRIATE_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern:
      /\b(where\s+can\s+i\s+buy|where\s+to\s+buy|who\s+sells|need\s+a\s+source|looking\s+for\s+a\s+source|source\s+for|vendor\s+link|group\s*buy|raws?\s+source)\b/i,
    reason:
      'Source and purchasing requests aren’t allowed. Keep discussion educational.',
  },
  {
    pattern:
      /\b(sell(?:ing)?|buy(?:ing)?|purchase|for\s+sale|dm\s+me\s+for\s+price|ship(?:ping)?\s+to)\b.{0,40}\b(peptide|vial|research\s+chem|retatrutide|semaglutide|tirzepatide|bpc|tb-?500)\b/i,
    reason: 'Buying or selling compounds isn’t allowed on the forum.',
  },
  {
    pattern:
      /\b(affiliate\s+code|discount\s+code|promo\s+code|use\s+my\s+code|coupon\s+code)\b/i,
    reason: 'Affiliate and promo code requests aren’t allowed.',
  },
  {
    pattern:
      /\b(kill\s+yourself|kys\b|unalive\s+yourself|go\s+die|hope\s+you\s+die)\b/i,
    reason: 'Threats and harmful language aren’t allowed.',
  },
  {
    pattern:
      /\b(rape|molest|child\s*porn|cp\b|underage\s+sex|loli|pedophil)/i,
    reason: 'This content violates community safety rules.',
  },
  {
    pattern:
      /\b(i'?m\s+having\s+a\s+(heart\s+attack|stroke)|call\s+911|emergency\s+room|overdosing|i\s+can'?t\s+breathe)\b/i,
    reason:
      'Medical emergencies don’t belong here — contact emergency services immediately.',
  },
  {
    pattern: /\b(t\.me\/|telegram\.me\/|discord\.gg\/|wa\.me\/)\S+/i,
    reason:
      'Messaging-app invite links aren’t allowed. Keep discussion on PepGuide.',
  },
];

function isSpammy(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/(.)\1{12,}/i.test(trimmed)) return true;
  if (/^(.{1,4})\1{8,}$/i.test(trimmed.replace(/\s+/g, ''))) return true;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (
    words.length >= 10 &&
    new Set(words.map((word) => word.toLowerCase())).size <= 2
  ) {
    return true;
  }
  return false;
}

function hasProfanity(text: string): boolean {
  const normalized = text
    .replace(/[@$]/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z0-9\s'-]/gi, ' ');
  return PROFANITY_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** Validate forum title/body/reply text before write. */
export function moderateForumText(
  parts: Array<string | null | undefined>,
): ForumModerationResult {
  const text = parts.filter(Boolean).join('\n').trim();
  if (!text) {
    return { ok: false, reason: 'Content can’t be empty.' };
  }

  if (isSpammy(text)) {
    return {
      ok: false,
      reason: 'That looks like spam or filler. Please write a clear post.',
    };
  }

  if (hasProfanity(text)) {
    return {
      ok: false,
      reason: 'Please keep language respectful — profanity isn’t allowed.',
    };
  }

  for (const rule of INAPPROPRIATE_PATTERNS) {
    if (rule.pattern.test(text)) {
      return { ok: false, reason: rule.reason };
    }
  }

  return { ok: true };
}

export function assertForumContentAllowed(
  ...parts: Array<string | null | undefined>
): void {
  const result = moderateForumText(parts);
  if (!result.ok) throw new Error(result.reason);
}
