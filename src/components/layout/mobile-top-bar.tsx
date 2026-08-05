'use client';

import { Menu, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Logo } from '@/src/components/brand/logo';
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

  const onChatRoute = pathname === '/chat' || pathname.startsWith('/chat/');
  const chatBlocked = isChatSendingBlocked(user);

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
    <header className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2.5 lg:hidden">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-10 shrink-0"
        aria-label="Open menu"
        onClick={openSidebar}
      >
        <Menu className="size-5" />
      </Button>
      <Link
        href="/chat"
        className="flex min-w-0 flex-1 items-center justify-center py-1"
      >
        <Logo variant="full" size="sm" />
      </Link>
      {onChatRoute ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-10 shrink-0"
          aria-label="New chat"
          disabled={chatBlocked}
          onClick={() => void handleNewChat()}
        >
          <Plus className="size-5" />
        </Button>
      ) : (
        <span className="size-10 shrink-0" aria-hidden />
      )}
    </header>
  );
}
