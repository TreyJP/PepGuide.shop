import type { UserProfile } from '@/src/types';

export function isChatSendingBlocked(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.accountStatus === 'suspended') return true;
  if (user.accountStatus !== 'cooldown' || !user.chatBlockedUntil) return false;
  const until = Date.parse(user.chatBlockedUntil);
  return Number.isFinite(until) && until > Date.now();
}

export function chatBlockMessage(user: UserProfile): string {
  if (user.accountStatus === 'suspended') {
    return 'Your account is suspended from chat for repeated PepGuide policy violations.';
  }
  if (user.chatBlockedUntil) {
    const until = new Date(user.chatBlockedUntil);
    if (Number.isFinite(until.getTime())) {
      return `Chat is temporarily locked until ${until.toLocaleString()}. Repeated out-of-scope requests triggered a cooldown.`;
    }
  }
  return 'Chat is temporarily locked after repeated policy violations.';
}
