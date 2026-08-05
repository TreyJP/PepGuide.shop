'use client';

import { Bookmark, Check, Copy } from 'lucide-react';
import { useState } from 'react';

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
    <div className="chat-thinking">
      <span className="chat-thinking-dots" aria-label="PepGuide is researching">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

function AssistantMark() {
  return (
    <span
      className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white"
      aria-hidden
    >
      P
    </span>
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
    <div className={cn('flex gap-3 px-1', className)}>
      <AssistantMark />
      <div className="min-w-0 flex-1 space-y-3 pt-0.5">
        {createdAt ? (
          <time
            dateTime={createdAt}
            className="hidden text-xs text-foreground-secondary sm:block"
          >
            {new Date(createdAt).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </time>
        ) : null}

        {showThinking ? <ThinkingIndicator /> : null}

        {showFailed ? (
          <p className="text-[15px] leading-relaxed text-foreground-secondary sm:text-sm">
            Something went wrong. Please try again.
          </p>
        ) : null}

        {!isStreaming && structuredReply ? (
          <WeightLossReply peptideIds={peptideIds} />
        ) : null}

        {!isStreaming && proUnlockReply ? (
          <div className="space-y-3">
            <p className="text-[15px] leading-relaxed text-foreground sm:text-sm">
              Guides and Protocols are part of{' '}
              <span className="font-semibold text-accent">PepGuide Pro</span>.
              Unlock them below to browse video lessons and goal-built stacks —
              or keep using free Chat and Library anytime.
            </p>
            <ProUnlockCard />
          </div>
        ) : null}

        {showPlainAnswer ? (
          <>
            <div
              className={cn(
                'chat-ai-bubble min-w-0 overflow-hidden',
                isStreaming && 'chat-ai-streaming',
              )}
            >
              {isStreaming ? (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words text-foreground sm:text-sm">
                  {content}
                  <span className="chat-stream-caret" aria-hidden />
                </p>
              ) : (
                <MarkdownContent
                  content={content}
                  className="text-[15px] leading-relaxed sm:text-sm"
                />
              )}
            </div>
            {!isStreaming && peptideIds.length > 0 ? (
              <WeightLossReply peptideIds={peptideIds} />
            ) : null}
            {!isStreaming ? (
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="size-8 rounded-full text-foreground-secondary"
                  aria-label={copied ? 'Copied' : 'Copy'}
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
                {onSave ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSave}
                    className="size-8 rounded-full text-foreground-secondary"
                    aria-label={saved ? 'Saved' : 'Save'}
                  >
                    <Bookmark
                      className={cn(
                        'size-3.5',
                        saved && 'fill-current text-accent',
                      )}
                    />
                  </Button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
