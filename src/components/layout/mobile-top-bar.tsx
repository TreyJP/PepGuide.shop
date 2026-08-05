'use client';

import { Menu, SquarePen } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/src/components/ui/button';
import {
  DEFAULT_EVIDENCE_DEPTH,
  DEFAULT_RESEARCH_MODE,
} from '@/src/constants/ai';
import { isChatSendingBlocked } from '@/src/lib/chat-access';
import { chatRepository } from '@/src/services/firestore/chats';
import { useAuthStore } from '@/src/stores/auth-store';
import { useChatStore } from '@/src/stores/chat-store';
import { useUiStore } from '@/src/stores/ui-store';

export function MobileTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const openSidebar = useUiStore((state) => state.openSidebar);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const user = useAuthStore((state) => state.user);
  const upsertChat = useChatStore((state) => state.upsertChat);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const setMessages = useChatStore((state) => state.setMessages);
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);

  const onChatRoute = pathname === '/chat' || pathname.startsWith('/chat/');
  const chatBlocked = isChatSendingBlocked(user);
  const activeTitle =
    chats.find((chat) => chat.id === activeChatId)?.title?.trim() || 'PepGuide';

  const handleNewChat = async () => {
    if (!user) {
      openSignInModal('Sign in to start a new research chat.');
      return;
    }
    if (chatBlocked) return;

    const chat = await chatRepository.createChat({
      researchMode: DEFAULT_RESEARCH_MODE,
      evidenceDepth: DEFAULT_EVIDENCE_DEPTH,
    });
    upsertChat(chat);
    setActiveChatId(chat.id);
    setMessages(chat.id, []);
    router.push(`/chat/${chat.id}`);
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 bg-white px-1.5 lg:hidden">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-10 shrink-0 rounded-full text-foreground"
        aria-label="Open menu"
        onClick={openSidebar}
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </Button>

      <Link
        href="/chat"
        className="min-w-0 flex-1 truncate px-1 text-center text-[15px] font-semibold tracking-tight text-foreground"
      >
        {onChatRoute ? activeTitle : 'PepGuide'}
      </Link>

      {onChatRoute ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-10 shrink-0 rounded-full text-foreground"
          aria-label="New chat"
          disabled={chatBlocked}
          onClick={() => void handleNewChat()}
        >
          <SquarePen className="size-5" strokeWidth={1.75} />
        </Button>
      ) : (
        <span className="size-10 shrink-0" aria-hidden />
      )}
    </header>
  );
}
