'use client';

import { Bookmark, Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/src/components/brand/logo';
import { MarkdownContent } from '@/src/components/chat/markdown-content';
import { ProUnlockCard } from '@/src/components/chat/pro-unlock-card';
import { WeightLossReply } from '@/src/components/chat/weight-loss-reply';
import { Button } from '@/src/components/ui/button';
import { PICKS_ONLY_ANSWER, PRO_UNLOCK_ANSWER } from '@/src/constants/chat';
import { cn } from '@/src/lib/utils';
import type { MessageStatus } from '@/src/types';

export type AiMessageProps = {
  content: string;
  status?: MessageStatus;
  createdAt?: string;
  peptideIds?: string[];
  onCopy?: () => void;
  onSave?: () => void;
  saved?: boolean;
  className?: string;
};

function ThinkingIndicator() {
  return (
    <div className="chat-ai-bubble chat-thinking px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="chat-thinking-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className="text-sm text-foreground-secondary">Researching</span>
      </div>
    </div>
  );
}

export function AiMessage({
  content,
  status = 'complete',
  createdAt,
  peptideIds = [],
  onCopy,
  onSave,
  saved = false,
  className,
}: AiMessageProps) {
  const [copied, setCopied] = useState(false);
  const isStreaming = status === 'streaming' || status === 'sending';
  const structuredReply =
    peptideIds.length > 0 &&
    (content === PICKS_ONLY_ANSWER || content.trim() === PICKS_ONLY_ANSWER);
  const proUnlockReply =
    content === PRO_UNLOCK_ANSWER || content.trim() === PRO_UNLOCK_ANSWER;
  const showPlainAnswer =
    Boolean(content) && !structuredReply && !proUnlockReply;
  const showThinking = isStreaming && !content;
  const showFailed =
    !isStreaming &&
    !content &&
    (status === 'error' || status === 'refused');

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex flex-col gap-3 sm:gap-4', className)}>
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 items-center">
          <Logo variant="full" size="sm" />
        </span>
        {createdAt ? (
          <time
            dateTime={createdAt}
            className="flex h-8 items-center text-xs leading-none text-foreground-secondary"
          >
            {new Date(createdAt).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </time>
        ) : null}
      </div>

      {showThinking ? <ThinkingIndicator /> : null}

      {showFailed ? (
        <div className="chat-ai-bubble px-4 py-3">
          <p className="text-sm text-foreground-secondary">
            Something went wrong. Please try again.
          </p>
        </div>
      ) : null}

      {!isStreaming && structuredReply ? (
        <WeightLossReply peptideIds={peptideIds} />
      ) : null}

      {!isStreaming && proUnlockReply ? (
        <div className="space-y-3">
          <div className="chat-ai-bubble px-4 py-3">
            <p className="text-sm leading-relaxed text-foreground">
              Guides and Protocols are part of{' '}
              <span className="font-semibold text-accent">PepGuide Pro</span>.
              Unlock them below to browse video lessons and goal-built stacks —
              or keep using free Chat and Library anytime.
            </p>
          </div>
          <ProUnlockCard />
        </div>
      ) : null}

      {showPlainAnswer ? (
        <>
          <div
            className={cn(
              'chat-ai-bubble min-w-0 overflow-hidden px-3 py-3 sm:px-4',
              isStreaming && 'chat-ai-streaming',
            )}
          >
            {isStreaming ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed break-words text-foreground">
                {content}
                <span className="chat-stream-caret" aria-hidden />
              </p>
            ) : (
              <MarkdownContent content={content} />
            )}
          </div>
          {!isStreaming && peptideIds.length > 0 ? (
            <WeightLossReply peptideIds={peptideIds} />
          ) : null}
          {!isStreaming ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-2.5 text-foreground-secondary"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              {onSave ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className="h-8 px-2.5 text-foreground-secondary"
                >
                  <Bookmark
                    className={cn(
                      'size-3.5',
                      saved && 'fill-current text-accent',
                    )}
                  />
                  {saved ? 'Saved' : 'Save'}
                </Button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
