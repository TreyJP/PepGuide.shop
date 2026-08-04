'use client';

import {
  Archive,
  ArchiveRestore,
  MessageSquarePlus,
  MoreHorizontal,
  Pin,
  PinOff,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { cn, groupChatsByDate } from '@/src/lib/utils';
import type { ChatSummary } from '@/src/types';

export type ChatSidebarProps = {
  chats: ChatSummary[];
  activeChatId?: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onPinChat?: (chatId: string) => void;
  onArchiveChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  className?: string;
};

type ChatGroup = {
  label: string;
  chats: ChatSummary[];
};

function ChatRow({
  chat,
  active,
  onSelect,
  onPin,
  onArchive,
  onDelete,
}: {
  chat: ChatSummary;
  active: boolean;
  onSelect: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative">
      <div
        className={cn(
          'flex w-full items-start gap-2 rounded-[12px] px-3 py-2.5 transition-colors',
          active
            ? 'bg-accent-muted text-foreground'
            : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground',
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <span className="line-clamp-1 text-sm font-medium">
            {chat.pinned ? '📌 ' : ''}
            {chat.title || 'Untitled chat'}
          </span>
          <span className="line-clamp-1 text-xs opacity-70">
            {chat.lastMessagePreview || 'No messages yet'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={cn(
            'shrink-0 rounded-[8px] p-1 opacity-0 transition-opacity hover:bg-surface-elevated group-hover:opacity-100',
            menuOpen && 'opacity-100',
          )}
          aria-label="Chat actions"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {menuOpen ? (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute right-2 top-10 z-20 min-w-[160px] rounded-[12px] border border-border bg-surface-elevated p-1 shadow-lg">
            {onPin ? (
              <button
                type="button"
                onClick={() => {
                  onPin();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-sm text-foreground hover:bg-surface-secondary"
              >
                {chat.pinned ? (
                  <PinOff className="size-3.5" />
                ) : (
                  <Pin className="size-3.5" />
                )}
                {chat.pinned ? 'Unpin' : 'Pin'}
              </button>
            ) : null}
            {onArchive ? (
              <button
                type="button"
                onClick={() => {
                  onArchive();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-sm text-foreground hover:bg-surface-secondary"
              >
                {chat.archived ? (
                  <ArchiveRestore className="size-3.5" />
                ) : (
                  <Archive className="size-3.5" />
                )}
                {chat.archived ? 'Unarchive' : 'Archive'}
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-sm text-critical hover:bg-critical-muted"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onPinChat,
  onArchiveChat,
  onDeleteChat,
  className,
}: ChatSidebarProps) {
  const [query, setQuery] = useState('');

  const visibleChats = useMemo(() => {
    const filtered = chats.filter((chat) => !chat.archived);
    if (!query.trim()) return filtered;
    const lower = query.toLowerCase();
    return filtered.filter(
      (chat) =>
        chat.title.toLowerCase().includes(lower) ||
        chat.lastMessagePreview.toLowerCase().includes(lower),
    );
  }, [chats, query]);

  const groups = useMemo((): ChatGroup[] => {
    const grouped = groupChatsByDate(visibleChats);
    return [
      { label: 'Pinned', chats: grouped.pinned },
      { label: 'Today', chats: grouped.today },
      { label: 'Previous 7 days', chats: grouped.previous7Days },
      { label: 'Previous 30 days', chats: grouped.previous30Days },
      { label: 'Older', chats: grouped.older },
    ].filter((group) => group.chats.length > 0);
  }, [visibleChats]);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface',
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <Button onClick={onNewChat} className="w-full justify-center">
          <MessageSquarePlus className="size-4" />
          New chat
        </Button>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-secondary" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats..."
            className="pl-9"
            aria-label="Search chats"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-foreground-secondary">
            {query ? 'No chats match your search.' : 'No chats yet. Start a new conversation.'}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-4">
              <h3 className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-foreground-secondary">
                {group.label}
              </h3>
              <div className="flex flex-col gap-0.5">
                {group.chats.map((chat) => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeChatId}
                    onSelect={() => onSelectChat(chat.id)}
                    onPin={onPinChat ? () => onPinChat(chat.id) : undefined}
                    onArchive={
                      onArchiveChat ? () => onArchiveChat(chat.id) : undefined
                    }
                    onDelete={
                      onDeleteChat ? () => onDeleteChat(chat.id) : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
