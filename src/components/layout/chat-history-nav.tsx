'use client';

import { Plus, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  DEFAULT_EVIDENCE_DEPTH,
  DEFAULT_RESEARCH_MODE,
} from '@/src/constants/ai';
import { groupChatsByDate } from '@/src/lib/utils';
import { chatRepository } from '@/src/services/firestore/chats';
import { useAuthStore } from '@/src/stores/auth-store';
import { useChatStore } from '@/src/stores/chat-store';
import { useUiStore } from '@/src/stores/ui-store';

export function ChatHistoryNav() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);

  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setChats = useChatStore((state) => state.setChats);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const setMessages = useChatStore((state) => state.setMessages);
  const upsertChat = useChatStore((state) => state.upsertChat);
  const removeChat = useChatStore((state) => state.removeChat);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }
    void (async () => {
      try {
        const list = await chatRepository.listChats();
        setChats(list);
      } catch {
        setChats([]);
      }
    })();
  }, [setChats, user]);

  if (!user) return null;

  const activeId =
    activeChatId ??
    (pathname.startsWith('/chat/') ? pathname.split('/')[2] : null);

  const grouped = groupChatsByDate(chats);

  const handleNewChat = async () => {
    const chat = await chatRepository.createChat({
      researchMode: DEFAULT_RESEARCH_MODE,
      evidenceDepth: DEFAULT_EVIDENCE_DEPTH,
    });
    upsertChat(chat);
    setActiveChatId(chat.id);
    setMessages(chat.id, []);
    router.push(`/chat/${chat.id}`);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId: string) => {
    await chatRepository.deleteChat(chatId);
    removeChat(chatId);
    if (activeId === chatId) {
      router.push('/chat');
    }
  };

  const renderGroup = (label: string, items: typeof chats) => {
    if (items.length === 0) return null;
    return (
      <div key={label} className="mb-3">
        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide text-foreground-secondary">
          {label}
        </p>
        <div className="space-y-0.5">
          {items.map((chat) => (
            <div key={chat.id} className="group flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleSelectChat(chat.id)}
                className={`min-w-0 flex-1 truncate rounded-[10px] px-2.5 py-1.5 text-left text-sm transition-colors ${
                  activeId === chat.id
                    ? 'bg-accent-muted text-accent'
                    : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground'
                }`}
              >
                {chat.title || 'Untitled chat'}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteChat(chat.id)}
                className="rounded-[8px] p-1 text-foreground-secondary opacity-100 transition-opacity hover:bg-surface-secondary hover:text-critical lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Delete chat"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-foreground-secondary">
          History
        </p>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          onClick={() => {
            if (!user) {
              openSignInModal('Sign in to start a new research chat.');
              return;
            }
            void handleNewChat();
          }}
          aria-label="New chat"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <div className="pr-0.5 pb-2">
        {chats.length === 0 ? (
          <p className="px-2 py-4 text-xs text-foreground-secondary">
            No chats yet. Tap + to start one.
          </p>
        ) : (
          <>
            {renderGroup('Pinned', grouped.pinned)}
            {renderGroup('Today', grouped.today)}
            {renderGroup('Previous 7 days', grouped.previous7Days)}
            {renderGroup('Previous 30 days', grouped.previous30Days)}
            {renderGroup('Older', grouped.older)}
          </>
        )}
      </div>
    </div>
  );
}
