'use client';

import { create } from 'zustand';

import type {
  ChatMessage,
  ChatSummary,
  EvidenceDepth,
  ResearchMode,
} from '@/src/types';

type ChatState = {
  chats: ChatSummary[];
  activeChatId: string | null;
  messagesByChat: Record<string, ChatMessage[]>;
  researchMode: ResearchMode;
  evidenceDepth: EvidenceDepth;
  isStreaming: boolean;
  setChats: (chats: ChatSummary[]) => void;
  upsertChat: (chat: ChatSummary) => void;
  setActiveChatId: (chatId: string | null) => void;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  appendMessage: (chatId: string, message: ChatMessage) => void;
  updateMessage: (
    chatId: string,
    messageId: string,
    patch: Partial<ChatMessage>,
  ) => void;
  /** Update an existing message, or append when a mid-send navigation wiped it. */
  upsertMessage: (chatId: string, message: ChatMessage) => void;
  setResearchMode: (mode: ResearchMode) => void;
  setEvidenceDepth: (depth: EvidenceDepth) => void;
  setIsStreaming: (streaming: boolean) => void;
  removeChat: (chatId: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatId: null,
  messagesByChat: {},
  researchMode: 'quick_overview',
  evidenceDepth: 'detailed',
  isStreaming: false,
  setChats: (chats) => set({ chats }),
  upsertChat: (chat) =>
    set((state) => {
      const exists = state.chats.some((item) => item.id === chat.id);
      return {
        chats: exists
          ? state.chats.map((item) => (item.id === chat.id ? chat : item))
          : [chat, ...state.chats],
      };
    }),
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messagesByChat: { ...state.messagesByChat, [chatId]: messages },
    })),
  appendMessage: (chatId, message) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [...(state.messagesByChat[chatId] ?? []), message],
      },
    })),
  updateMessage: (chatId, messageId, patch) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: (state.messagesByChat[chatId] ?? []).map((message) =>
          message.id === messageId ? { ...message, ...patch } : message,
        ),
      },
    })),
  upsertMessage: (chatId, message) =>
    set((state) => {
      const current = state.messagesByChat[chatId] ?? [];
      const index = current.findIndex((item) => item.id === message.id);
      if (index === -1) {
        return {
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: [...current, message],
          },
        };
      }
      const next = [...current];
      next[index] = { ...next[index], ...message };
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: next,
        },
      };
    }),
  setResearchMode: (mode) => set({ researchMode: mode }),
  setEvidenceDepth: (depth) => set({ evidenceDepth: depth }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  removeChat: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.messagesByChat;
      return {
        chats: state.chats.filter((chat) => chat.id !== chatId),
        messagesByChat: rest,
        activeChatId:
          state.activeChatId === chatId ? null : state.activeChatId,
      };
    }),
}));
