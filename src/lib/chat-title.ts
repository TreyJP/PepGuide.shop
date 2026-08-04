export const DEFAULT_CHAT_TITLE = 'New chat';

const TOPIC_TITLES: { pattern: RegExp; title: string }[] = [
  { pattern: /\b(weight|lose|loss|obesity|fat loss|glp-?1)\b/i, title: 'Weight loss research' },
  { pattern: /\b(heal|recovery|injury|bpc|tb-?500)\b/i, title: 'Healing research' },
  { pattern: /\b(sleep|insomnia|circadian)\b/i, title: 'Sleep research' },
  { pattern: /\b(hair|alopecia|bald)\b/i, title: 'Hair research' },
  { pattern: /\b(skin|cosmetic|wrinkle|tanning|melanotan)\b/i, title: 'Skin & cosmetic research' },
  { pattern: /\b(sexual|libido|pt-?141|erectile)\b/i, title: 'Sexual health research' },
  { pattern: /\b(cognitive|memory|focus|semax|selank)\b/i, title: 'Cognitive research' },
  { pattern: /\b(growth hormone|secretagogue|mk-?677|ipamorelin|cjc)\b/i, title: 'GH research' },
  { pattern: /\bcompare\b/i, title: 'Compound comparison' },
];

function cleanTitle(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .map((word) => {
      if (word.length <= 2) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/** Build a short sidebar title from the first user message. */
export function deriveChatTitle(message: string): string {
  const cleaned = cleanTitle(message);
  if (!cleaned) return DEFAULT_CHAT_TITLE;

  for (const rule of TOPIC_TITLES) {
    if (rule.pattern.test(cleaned)) return rule.title;
  }

  // Fall back to a tightened version of the question.
  const shortened = cleaned
    .replace(/^(what|which|how|can|could|should|do|does|is|are|tell me|help me)\b[\s,]*/i, '')
    .replace(/\?+$/g, '')
    .trim();

  const base = shortened || cleaned;
  const clipped = base.length > 42 ? `${base.slice(0, 42).trim()}…` : base;
  return toTitleCase(clipped);
}

export function isDefaultChatTitle(title: string | null | undefined): boolean {
  if (!title) return true;
  const normalized = title.trim().toLowerCase();
  return (
    normalized === DEFAULT_CHAT_TITLE.toLowerCase() ||
    normalized === 'new research chat' ||
    normalized === 'untitled chat'
  );
}
