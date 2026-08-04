'use client';

import Image from 'next/image';

import { cn } from '@/src/lib/utils';

export type LogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** full = pill + PepGuide wordmark; mark = alternate transparent mark; icon = app icon tile */
  variant?: 'full' | 'mark' | 'icon-light' | 'icon-vibrant';
  priority?: boolean;
};

/** Display heights — kept compact so the wordmark stays crisp. */
const heightMap = {
  sm: 26,
  md: 34,
  lg: 44,
} as const;

const iconSizeMap = {
  sm: 28,
  md: 36,
  lg: 48,
} as const;

/** Intrinsic asset sizes (for sharp Next/Image srcset on retina). */
const FULL_INTRINSIC = { width: 1483, height: 377 } as const;
const MARK_INTRINSIC = { width: 1083, height: 266 } as const;

export function Logo({
  className,
  size = 'md',
  variant = 'full',
  priority = false,
}: LogoProps) {
  if (variant === 'full' || variant === 'mark') {
    const intrinsic = variant === 'full' ? FULL_INTRINSIC : MARK_INTRINSIC;
    const src =
      variant === 'full'
        ? '/brand/logo-transparent.png'
        : '/brand/logo-transparent-mark.png';
    const height = heightMap[size];

    return (
      <Image
        src={src}
        alt="PepGuide"
        width={intrinsic.width}
        height={intrinsic.height}
        priority={priority}
        quality={100}
        sizes={`${Math.round(height * (intrinsic.width / intrinsic.height) * 2)}px`}
        className={cn('h-auto w-auto object-contain', className)}
        style={{ height, width: 'auto' }}
      />
    );
  }

  const icon = iconSizeMap[size];
  const src =
    variant === 'icon-vibrant'
      ? '/brand/icon-vibrant.png'
      : '/brand/icon-light.png';

  return (
    <Image
      src={src}
      alt="PepGuide"
      width={icon * 2}
      height={icon * 2}
      priority={priority}
      quality={100}
      sizes={`${icon * 2}px`}
      className={cn('rounded-[10px] object-contain', className)}
      style={{ width: icon, height: icon }}
    />
  );
}
