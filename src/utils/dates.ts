export function groupChatsByDate<T extends { updatedAt: string; pinned?: boolean }>(
  chats: T[],
): {
  pinned: T[];
  today: T[];
  previous7Days: T[];
  previous30Days: T[];
  older: T[];
} {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const pinned: T[] = [];
  const today: T[] = [];
  const previous7Days: T[] = [];
  const previous30Days: T[] = [];
  const older: T[] = [];

  for (const chat of chats) {
    if (chat.pinned) {
      pinned.push(chat);
      continue;
    }
    const updated = new Date(chat.updatedAt);
    if (updated >= startOfToday) {
      today.push(chat);
    } else if (updated >= sevenDaysAgo) {
      previous7Days.push(chat);
    } else if (updated >= thirtyDaysAgo) {
      previous30Days.push(chat);
    } else {
      older.push(chat);
    }
  }

  return { pinned, today, previous7Days, previous30Days, older };
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function createId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
