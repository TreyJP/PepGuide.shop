'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/src/components/brand/logo';
import { Button } from '@/src/components/ui/button';
import { useUiStore } from '@/src/stores/ui-store';

export function MobileTopBar() {
  const openSidebar = useUiStore((state) => state.openSidebar);

  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2.5 lg:hidden">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-10 shrink-0"
        aria-label="Open menu"
        onClick={openSidebar}
      >
        <Menu className="size-5" />
      </Button>
      <Link
        href="/chat"
        className="flex min-w-0 flex-1 items-center justify-center py-1"
      >
        <Logo variant="full" size="sm" />
      </Link>
      <span className="size-10 shrink-0" aria-hidden />
    </header>
  );
}
