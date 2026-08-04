'use client';

import { use } from 'react';

import { ChatWorkspace } from '@/src/components/chat/chat-workspace';

export default function ChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  return <ChatWorkspace chatId={chatId} />;
}
