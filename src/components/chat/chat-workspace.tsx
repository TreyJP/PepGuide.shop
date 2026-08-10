'use client';

import { Plus, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { AiMessage } from '@/src/components/chat/ai-message';
import { EmptyChat } from '@/src/components/chat/empty-chat';
import { MessageComposer } from '@/src/components/chat/message-composer';
import { UserMessage } from '@/src/components/chat/user-message';
import { Button } from '@/src/components/ui/button';
import {
  DEFAULT_EVIDENCE_DEPTH,
  DEFAULT_RESEARCH_MODE,
  PEP_GUIDE_MODEL,
} from '@/src/constants/ai';
import {
  CHAT_CONTEXT_LIMITS,
  PICKS_ONLY_ANSWER,
  PRO_UNLOCK_ANSWER,
} from '@/src/constants/chat';
import { useProAccess } from '@/src/hooks/use-pro-access';
import { chatBlockMessage, isChatSendingBlocked } from '@/src/lib/chat-access';
import { mergeChatMessages } from '@/src/lib/chat-messages';
import { deriveChatTitle, isDefaultChatTitle } from '@/src/lib/chat-title';
import {
  ChatApiError,
  sendChatMessage,
  type ChatModerationState,
} from '@/src/services/api/ai';
import { chatRepository } from '@/src/services/firestore/chats';
import { userRepository } from '@/src/services/firestore/users';
import { useAuthStore } from '@/src/stores/auth-store';
import { useChatStore } from '@/src/stores/chat-store';
import { useUiStore } from '@/src/stores/ui-store';
import type { ChatMessage } from '@/src/types';
import { createId } from '@/src/utils/dates';

export type ChatWorkspaceProps = {
  chatId?: string;
};

function estimateThreadTokens(messages: ChatMessage[]): number {
  const chars = messages.reduce(
    (sum, message) => sum + (message.content?.length ?? 0),
    0,
  );
  return Math.ceil(chars / 4);
}

function shouldRotateChatContext(messages: ChatMessage[]): boolean {
  if (messages.length >= CHAT_CONTEXT_LIMITS.maxMessages) return true;
  return (
    estimateThreadTokens(messages) >= CHAT_CONTEXT_LIMITS.maxEstimatedTokens
  );
}

function toApiHistoryTurns(messages: ChatMessage[]) {
  return messages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        message.status === 'complete' &&
        Boolean(message.content?.trim()),
    )
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content:
        message.content === PICKS_ONLY_ANSWER
          ? '[Presented top research picks with dosing guide.]'
          : message.content === PRO_UNLOCK_ANSWER
            ? '[Presented PepGuide Pro unlock card.]'
            : message.content,
    }));
}

function formatChatError(error: unknown): string {
  if (error instanceof ChatApiError) {
    const parts = [error.message];
    if (error.code) parts.push(`Code: ${error.code}`);
    if (error.status) parts.push(`HTTP ${error.status}`);
    if (error.detail && error.detail !== error.message) {
      parts.push(`Detail: ${error.detail}`);
    }
    return parts.join('\n');
  }
  if (error instanceof Error && error.message) {
    return `Something went wrong.\nDetail: ${error.message}`;
  }
  return 'Something went wrong. Please try again.';
}

export function ChatWorkspace({ chatId }: ChatWorkspaceProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendLockRef = useRef(false);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const { isPro } = useProAccess();
  const chatBlocked = isChatSendingBlocked(user);

  const requireAuth = useCallback(
    (message?: string) => {
      // Read live store — Google sign-in can settle right after navigation.
      if (useAuthStore.getState().user) return true;
      openSignInModal(
        message ?? 'Sign in to chat with PepGuide AI and save your research.',
      );
      return false;
    },
    [openSignInModal],
  );

  const applyModeration = useCallback(
    async (moderation?: ChatModerationState) => {
      if (!moderation || !user) return;

      if (
        moderation.accountStatus ||
        moderation.chatBlockedUntil !== undefined ||
        moderation.abuseStrikeCount !== undefined
      ) {
        updateUser({
          ...(moderation.accountStatus
            ? { accountStatus: moderation.accountStatus }
            : {}),
          ...(moderation.chatBlockedUntil !== undefined
            ? { chatBlockedUntil: moderation.chatBlockedUntil }
            : {}),
          ...(moderation.abuseStrikeCount !== undefined
            ? { abuseStrikeCount: moderation.abuseStrikeCount }
            : {}),
        });
      }

      try {
        const fresh = await userRepository.getProfile(user.id);
        if (fresh) {
          updateUser({
            accountStatus: fresh.accountStatus,
            chatBlockedUntil: fresh.chatBlockedUntil,
            abuseStrikeCount: fresh.abuseStrikeCount,
          });
        }
      } catch {
        // Local store patch above is enough if refresh fails.
      }
    },
    [updateUser, user],
  );

  const activeChatId = useChatStore((state) => state.activeChatId);
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const isStreaming = useChatStore((state) => state.isStreaming);

  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const setMessages = useChatStore((state) => state.setMessages);
  const appendMessage = useChatStore((state) => state.appendMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const upsertMessage = useChatStore((state) => state.upsertMessage);
  const setIsStreaming = useChatStore((state) => state.setIsStreaming);
  const upsertChat = useChatStore((state) => state.upsertChat);

  const resolvedChatId = chatId ?? activeChatId;
  const messages = resolvedChatId ? (messagesByChat[resolvedChatId] ?? []) : [];

  useEffect(() => {
    if (!chatId || !user) return;
    setActiveChatId(chatId);
    let cancelled = false;

    void (async () => {
      try {
        const loaded = await chatRepository.listMessages(chatId);
        if (cancelled) return;

        const state = useChatStore.getState();
        const local = state.messagesByChat[chatId] ?? [];
        const preferLocalOrder =
          state.isStreaming ||
          local.some(
            (message) =>
              message.status === 'streaming' || message.status === 'sending',
          );

        // Keep optimistic / in-flight messages and never scramble turn order.
        setMessages(
          chatId,
          mergeChatMessages(loaded, local, { preferLocalOrder }),
        );
      } catch (error) {
        console.error('[PepGuide chat] Failed to load messages', error);
        if (cancelled) return;
        const local = useChatStore.getState().messagesByChat[chatId] ?? [];
        if (local.length === 0) {
          setMessages(chatId, []);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId, setActiveChatId, setMessages, user]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Stick to bottom instantly while generating so the reply never feels stuck.
    el.scrollTo({
      top: el.scrollHeight,
      behavior: isStreaming ? 'auto' : 'smooth',
    });
  }, [messages, isStreaming]);

  const handleNewChat = async () => {
    if (!requireAuth('Sign in to start a new research chat.')) return;
    if (user && isChatSendingBlocked(user)) return;
    const chat = await chatRepository.createChat({
      researchMode: DEFAULT_RESEARCH_MODE,
      evidenceDepth: DEFAULT_EVIDENCE_DEPTH,
    });
    upsertChat(chat);
    setActiveChatId(chat.id);
    setMessages(chat.id, []);
    router.push(`/chat/${chat.id}`);
  };

  const handleSend = useCallback(
    async (content: string) => {
      if (sendLockRef.current || useChatStore.getState().isStreaming) {
        console.warn('[PepGuide chat] Ignoring duplicate send while in flight');
        return;
      }
      sendLockRef.current = true;

      // Prefer live store state — mobile sign-in can settle a moment after navigation.
      const liveUser = useAuthStore.getState().user;
      if (!liveUser) {
        sendLockRef.current = false;
        openSignInModal(
          'Sign in to chat with PepGuide AI and save your research.',
        );
        return;
      }

      if (isChatSendingBlocked(liveUser)) {
        sendLockRef.current = false;
        return;
      }

      let shouldOpenChatRoute = false;
      let assistantId = '';
      let assistantMessage: ChatMessage | null = null;
      let currentChatId: string | null = resolvedChatId;
      let carriedHistory: Array<{ role: 'user' | 'assistant'; content: string }> =
        [];

      try {
        if (!currentChatId) {
          const chat = await chatRepository.createChat({
            researchMode: DEFAULT_RESEARCH_MODE,
            evidenceDepth: DEFAULT_EVIDENCE_DEPTH,
          });

          upsertChat(chat);
          setActiveChatId(chat.id);
          currentChatId = chat.id;
          shouldOpenChatRoute = true;
        }

        // Narrow for closures — TS won't treat `let` as non-null inside onToken.
        if (!currentChatId) {
          throw new Error('Chat id missing after create.');
        }

        // Auto-rotate when the thread is too long for a reliable context window.
        const existingThread =
          useChatStore.getState().messagesByChat[currentChatId] ?? [];
        if (shouldRotateChatContext(existingThread)) {
          const previousChatId = currentChatId;
          const previousChat = useChatStore
            .getState()
            .chats.find((chat) => chat.id === previousChatId);
          carriedHistory = toApiHistoryTurns(existingThread).slice(
            -CHAT_CONTEXT_LIMITS.carryHistoryTurns,
          );

          const nextChat = await chatRepository.createChat({
            researchMode: DEFAULT_RESEARCH_MODE,
            evidenceDepth: DEFAULT_EVIDENCE_DEPTH,
          });
          const continuedTitle = previousChat?.title
            ? `Continued: ${previousChat.title.replace(/^Continued:\s*/i, '').slice(0, 48)}`
            : 'Continued chat';

          upsertChat({
            ...nextChat,
            title: continuedTitle,
            lastMessagePreview: content.slice(0, 120),
          });
          setActiveChatId(nextChat.id);
          setMessages(nextChat.id, []);
          currentChatId = nextChat.id;
          shouldOpenChatRoute = true;

          console.info('[PepGuide chat] Rotated chat for context limits', {
            previousChatId,
            nextChatId: nextChat.id,
            priorMessages: existingThread.length,
            estimatedTokens: estimateThreadTokens(existingThread),
          });
        }

        const activeChatIdForSend = currentChatId;

        const sentAt = Date.now();
        const userMessage: ChatMessage = {
          id: createId('msg'),
          chatId: activeChatIdForSend,
          role: 'user',
          content,
          createdAt: new Date(sentAt).toISOString(),
          status: 'complete',
          classifications: [],
          citations: [],
          evidenceCards: [],
          safetyAction: 'allow',
        };

        assistantId = createId('msg');
        assistantMessage = {
          id: assistantId,
          chatId: activeChatIdForSend,
          role: 'assistant',
          content: '',
          // Always after the user turn so sorts can't flip the pair.
          createdAt: new Date(sentAt + 1).toISOString(),
          status: 'streaming',
          classifications: [],
          citations: [],
          evidenceCards: [],
          safetyAction: 'allow',
        };

        // Paint immediately — persist in the background so the void never feels empty.
        appendMessage(activeChatIdForSend, userMessage);
        appendMessage(activeChatIdForSend, assistantMessage);
        setIsStreaming(true);

        // Navigate after optimistic paint so mobile /chat → /chat/[id] keeps the thread.
        if (shouldOpenChatRoute) {
          router.replace(`/chat/${activeChatIdForSend}`);
        }

        const existingChat = useChatStore
          .getState()
          .chats.find((chat) => chat.id === activeChatIdForSend);
        if (existingChat && isDefaultChatTitle(existingChat.title)) {
          upsertChat({
            ...existingChat,
            title: deriveChatTitle(content),
            lastMessagePreview: content.slice(0, 120),
            updatedAt: userMessage.createdAt,
          });
        }

        void chatRepository.appendMessage(userMessage).catch((error) => {
          console.error('[PepGuide chat] Failed to persist user message', error);
        });

        const priorMessages =
          useChatStore.getState().messagesByChat[activeChatIdForSend] ?? [];
        const history =
          carriedHistory.length > 0
            ? carriedHistory
            : toApiHistoryTurns(
                priorMessages.filter(
                  (message) =>
                    message.id !== userMessage.id &&
                    message.id !== assistantId,
                ),
              ).slice(-12);

        console.info('[PepGuide chat] Sending message', {
          chatId: activeChatIdForSend,
          contentLength: content.length,
          historyTurns: history.length,
          isPro,
        });

        const response = await sendChatMessage({
          chatId: activeChatIdForSend,
          content,
          history,
          isPro,
          onToken: (token) => {
            const existing = useChatStore
              .getState()
              .messagesByChat[activeChatIdForSend]?.find(
                (message) => message.id === assistantId,
              );
            if (!existing) {
              upsertMessage(activeChatIdForSend, {
                ...assistantMessage!,
                content: token,
                status: 'streaming',
              });
              return;
            }
            updateMessage(activeChatIdForSend, assistantId, {
              content: `${existing.content ?? ''}${token}`,
            });
          },
        });

        await applyModeration(response.moderation);

        const completed: ChatMessage = {
          ...assistantMessage,
          content: response.answer,
          status:
            response.safetyAction === 'refuse' ||
            response.safetyAction === 'rate_limit'
              ? 'refused'
              : 'complete',
          classifications: [response.classification],
          citations: response.citations,
          evidenceCards: response.evidenceCards,
          safetyAction: response.safetyAction,
          suggestedQuestions: response.suggestedQuestions,
          peptideIds: response.peptideIds,
          modelVersion: PEP_GUIDE_MODEL,
        };

        upsertMessage(activeChatIdForSend, completed);
        void chatRepository.appendMessage(completed).catch((error) => {
          console.error(
            '[PepGuide chat] Failed to persist assistant message',
            error,
          );
        });

        const updatedChat = await chatRepository.updateChat(
          activeChatIdForSend,
          {
            researchMode: DEFAULT_RESEARCH_MODE,
            evidenceDepth: DEFAULT_EVIDENCE_DEPTH,
          },
        );
        upsertChat(updatedChat);
      } catch (error) {
        console.error('[PepGuide chat] Send failed', error);
        if (error instanceof ChatApiError) {
          await applyModeration(error.moderation);
        }

        if (currentChatId && assistantMessage) {
          const fallback =
            error instanceof ChatApiError ? error.response : undefined;
          upsertMessage(currentChatId, {
            ...assistantMessage,
            content: fallback?.answer ?? formatChatError(error),
            status:
              fallback?.safetyAction === 'refuse' ||
              fallback?.safetyAction === 'rate_limit' ||
              (error instanceof ChatApiError &&
                (error.status === 403 || error.status === 429))
                ? 'refused'
                : 'error',
            classifications: fallback ? [fallback.classification] : [],
            safetyAction: fallback?.safetyAction ?? 'refuse',
            suggestedQuestions: fallback?.suggestedQuestions,
            peptideIds: fallback?.peptideIds,
          });
        }
      } finally {
        setIsStreaming(false);
        sendLockRef.current = false;
      }
    },
    [
      appendMessage,
      applyModeration,
      isPro,
      openSignInModal,
      resolvedChatId,
      router,
      setActiveChatId,
      setIsStreaming,
      updateMessage,
      upsertChat,
      upsertMessage,
    ],
  );

  return (
    <div className="chat-design-root">
      {/* Desktop only — on mobile, New lives in the top bar next to the menu. */}
      <header className="chat-header hidden items-center justify-end border-b px-4 py-2 lg:flex">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void handleNewChat()}
          aria-label="New chat"
          className="shrink-0 gap-1.5"
          disabled={chatBlocked}
        >
          <Plus className="size-4" />
          <span>New</span>
        </Button>
      </header>

      {user && chatBlocked ? (
        <div className="border-b border-border bg-surface-secondary px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-start gap-2.5 text-sm text-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>{chatBlockMessage(user)}</p>
          </div>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="scrollbar-theme min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 sm:px-4 sm:py-6"
      >
        {messages.length === 0 ? (
          <EmptyChat
            onSelectPrompt={chatBlocked ? () => undefined : handleSend}
          />
        ) : (
          <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6 pb-4 sm:gap-7">
            {messages.map((message) =>
              message.role === 'user' ? (
                <UserMessage
                  key={message.id}
                  content={message.content}
                  createdAt={message.createdAt}
                />
              ) : (
                <AiMessage
                  key={message.id}
                  content={message.content}
                  status={message.status}
                  createdAt={message.createdAt}
                  peptideIds={message.peptideIds}
                  suggestedQuestions={
                    message.id === messages[messages.length - 1]?.id
                      ? message.suggestedQuestions
                      : undefined
                  }
                  onSelectQuestion={
                    chatBlocked || isStreaming ? undefined : handleSend
                  }
                />
              ),
            )}
          </div>
        )}
      </div>

      <MessageComposer
        onSubmit={handleSend}
        loading={isStreaming}
        disabled={chatBlocked}
      />
    </div>
  );
}
