'use client';

import ReactMarkdown from 'react-markdown';

import { cn } from '@/src/lib/utils';

export function MarkdownContent({
  content,
  className,
  variant = 'chat',
}: {
  content: string;
  className?: string;
  /** Forum posts use larger section headers for guideline-style writing. */
  variant?: 'chat' | 'forum';
}) {
  const forum = variant === 'forum';

  return (
    <div
      className={cn(
        'min-w-0 max-w-full overflow-hidden text-sm leading-relaxed break-words text-foreground',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className,
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1
              className={cn(
                'mb-3 font-[family-name:var(--font-display)] font-semibold tracking-tight text-foreground',
                forum ? 'mt-5 text-lg sm:mt-6 sm:text-2xl' : 'mt-1 text-lg',
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                'mb-2.5 font-[family-name:var(--font-display)] font-semibold text-foreground',
                forum ? 'mt-5 text-lg' : 'mt-4 text-base',
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={cn(
                'mb-2 font-semibold text-foreground',
                forum ? 'mt-4 text-base' : 'mt-4 text-sm',
              )}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-sm leading-relaxed break-words text-foreground">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-2 pl-5 text-sm text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-2 pl-5 text-sm text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed break-words marker:text-foreground-secondary">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-accent/40 bg-surface-secondary/50 py-1 pl-3 pr-2 text-sm italic text-foreground-secondary">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="break-words font-medium text-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="mb-3 max-w-full overflow-x-auto rounded-[12px] bg-surface-secondary px-3 py-2 text-xs">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-secondary px-1 py-0.5 text-[0.9em]">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="mb-3 max-w-full overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          hr: () => <hr className={cn('border-border', forum ? 'my-6' : 'my-4')} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Plain-text preview for list cards (strips common markdown markers). */
export function markdownToPreview(content: string, maxLength = 160): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^---+$/gm, ' ')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}
