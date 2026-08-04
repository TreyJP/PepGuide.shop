'use client';

import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/src/lib/utils';

const variantStyles = {
  primary:
    'bg-accent text-white hover:opacity-90 border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.12)]',
  secondary:
    'bg-surface text-foreground border border-border hover:bg-surface-secondary',
  ghost:
    'bg-transparent text-foreground-secondary hover:bg-surface-secondary hover:text-foreground border border-transparent',
  destructive:
    'bg-critical text-white hover:opacity-90 border border-transparent',
} as const;

const sizeStyles = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-[10px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[12px]',
  lg: 'h-11 px-5 text-base gap-2 rounded-[14px]',
  icon: 'h-10 w-10 rounded-[12px]',
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="size-4 shrink-0 animate-spin" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
