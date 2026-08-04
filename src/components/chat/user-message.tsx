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
        <div className="rounded-[16px] rounded-br-[6px] bg-accent px-4 py-3 text-sm leading-relaxed text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
          <p className="whitespace-pre-wrap">{content}</p>
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
