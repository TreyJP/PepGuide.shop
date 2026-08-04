'use client';

import {
  Calculator,
  Library,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Logo } from '@/src/components/brand/logo';
import { ChatHistoryNav } from '@/src/components/layout/chat-history-nav';
import { Button } from '@/src/components/ui/button';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

const NAV_ITEMS = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/cycle', label: 'Cycle', icon: RefreshCw },
  { href: '/calculator', label: 'Calculator', icon: Calculator },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const { isAdmin } = useAdminAccess();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-3 py-3">
        <Link
          href="/chat"
          className="flex items-center justify-center rounded-[12px] px-2 py-2"
        >
          <Logo variant="full" size="sm" priority />
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        <nav className="flex shrink-0 flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent-muted text-accent'
                    : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === '/admin' || pathname.startsWith('/admin/')
                  ? 'bg-accent-muted text-accent'
                  : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground',
              )}
            >
              <Shield className="size-4 shrink-0" />
              Admin
            </Link>
          ) : null}
        </nav>

        <ChatHistoryNav />
      </div>

      <div className="border-t border-border p-3">
        {user ? (
          <div className="space-y-1 px-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user.displayName}
            </p>
            <p className="truncate text-xs text-foreground-secondary">{user.email}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              className="w-full"
              size="sm"
              onClick={() =>
                openSignInModal('Sign in to chat with PepGuide AI and save research.')
              }
            >
              Sign in
            </Button>
            <Button
              className="w-full"
              size="sm"
              variant="ghost"
              onClick={() => router.push('/welcome')}
            >
              About PepGuide
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
