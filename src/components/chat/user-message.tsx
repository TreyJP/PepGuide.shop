import { cn } from '@/src/lib/utils';

export type UserMessageProps = {
  content: string;
  createdAt?: string;
  className?: string;
};

export function UserMessage({ content, createdAt, className }: UserMessageProps) {
  return (
    <div className={cn('flex justify-end', className)}>
      <div className="flex max-w-[85%] flex-col items-end gap-1.5 sm:max-w-[75%]">
        <div className="chat-user-bubble max-w-full px-4 py-3 text-sm leading-relaxed">
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {content}
          </p>
        </div>
        {createdAt ? (
          <time
            dateTime={createdAt}
            className="text-xs text-foreground-secondary"
          >
            {new Date(createdAt).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </time>
        ) : null}
      </div>
    </div>
  );
}
