import type { ChatMessage } from '@/src/types';

const ROLE_ORDER: Record<ChatMessage['role'], number> = {
  user: 0,
  assistant: 1,
  system: 2,
};

/** Stable chronological order — user always before assistant when timestamps tie. */
export function sortChatMessages(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const byTime = a.createdAt.localeCompare(b.createdAt);
    if (byTime !== 0) return byTime;

    const byRole = (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9);
    if (byRole !== 0) return byRole;

    return a.id.localeCompare(b.id);
  });
}

export function dedupeChatMessages(messages: ChatMessage[]): ChatMessage[] {
  const seenIds = new Set<string>();
  const seenFingerprints = new Set<string>();
  const result: ChatMessage[] = [];

  for (const message of messages) {
    if (seenIds.has(message.id)) continue;

    const fingerprint =
      message.content.trim().length > 0
        ? `${message.role}|${message.content.trim()}|${message.createdAt.slice(0, 19)}`
        : null;

    if (
      fingerprint &&
      seenFingerprints.has(fingerprint) &&
      message.status !== 'streaming' &&
      message.status !== 'sending'
    ) {
      continue;
    }

    seenIds.add(message.id);
    if (fingerprint) seenFingerprints.add(fingerprint);
    result.push(message);
  }

  return result;
}

/**
 * Merge remote + local messages without scrambling turn order.
 * Prefers local in-flight content; keeps local sequence when streaming.
 */
export function mergeChatMessages(
  remote: ChatMessage[],
  local: ChatMessage[],
  options?: { preferLocalOrder?: boolean },
): ChatMessage[] {
  const preferLocalOrder = Boolean(options?.preferLocalOrder);
  const byId = new Map<string, ChatMessage>();

  for (const message of remote) {
    byId.set(message.id, message);
  }

  for (const message of local) {
    const existing = byId.get(message.id);
    if (!existing) {
      byId.set(message.id, message);
      continue;
    }

    const localInFlight =
      message.status === 'streaming' || message.status === 'sending';
    const localRicher =
      (message.content?.length ?? 0) > (existing.content?.length ?? 0);

    if (localInFlight || localRicher || preferLocalOrder) {
      byId.set(message.id, { ...existing, ...message });
    }
  }

  if (preferLocalOrder && local.length > 0) {
    const ordered: ChatMessage[] = [];
    const used = new Set<string>();

    for (const message of local) {
      const merged = byId.get(message.id);
      if (!merged || used.has(merged.id)) continue;
      ordered.push(merged);
      used.add(merged.id);
    }

    for (const message of sortChatMessages([...byId.values()])) {
      if (used.has(message.id)) continue;
      ordered.push(message);
      used.add(message.id);
    }

    return dedupeChatMessages(ordered);
  }

  return dedupeChatMessages(sortChatMessages([...byId.values()]));
}
