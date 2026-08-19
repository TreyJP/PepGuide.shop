'use client';

import { Check } from 'lucide-react';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/src/lib/utils';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label: ReactNode;
  description?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, disabled, ...props }, ref) => {
    const autoId = useId();
    const checkboxId =
      id ??
      (typeof label === 'string'
        ? label.toLowerCase().replace(/\s+/g, '-')
        : autoId);

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'group flex cursor-pointer items-start gap-3 rounded-[14px] border border-transparent p-3',
          'transition-colors hover:bg-surface-secondary/60',
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            'relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-border bg-surface',
            'transition-colors group-has-[:checked]:border-accent group-has-[:checked]:bg-accent',
          )}
        >
          <Check className="size-3.5 text-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {description ? (
            <span className="text-sm text-foreground-secondary">
              {description}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
