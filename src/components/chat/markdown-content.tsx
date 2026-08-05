'use client';

import ReactMarkdown from 'react-markdown';

import { cn } from '@/src/lib/utils';

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
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
            <h1 className="mb-3 mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground">
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
          hr: () => <hr className="my-4 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
