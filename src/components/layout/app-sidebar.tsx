'use client';

import {
  Bookmark,
  BookOpen,
  Calculator,
  FlaskConical,
  Library,
  Lock,
  MessageCircleQuestion,
  MessageSquare,
  MessagesSquare,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Logo } from '@/src/components/brand/logo';
import { ChatHistoryNav } from '@/src/components/layout/chat-history-nav';
import { Button } from '@/src/components/ui/button';
import { PRO_COMING_SOON } from '@/src/constants/billing';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useProAccess } from '@/src/hooks/use-pro-access';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

const MAIN_NAV = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/pro/forum', label: 'Questions & Discussion', icon: MessagesSquare },
  { href: '/library', label: 'All Peptides', icon: Library },
  { href: '/cycle', label: 'Cycle', icon: RefreshCw },
  { href: '/calculator', label: 'Calculator', icon: Calculator },
] as const;

const PRO_NAV = [
  { href: '/pro/guides', label: 'Education & Research', icon: BookOpen },
  { href: '/pro/protocols', label: 'Protocols', icon: FlaskConical },
  { href: '/pro/bookmarks', label: 'Bookmarks', icon: Bookmark },
  {
    href: '/pro/ask',
    label: 'Ask a Professional',
    icon: MessageCircleQuestion,
  },
  {
    href: '/pro/vendor-reviews',
    label: 'Vendor Reviews',
    icon: Star,
    /** Open to every signed-in member (not Pro-locked / coming soon). */
    openToAll: true,
  },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  locked,
  comingSoon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof MessageSquare;
  active: boolean;
  locked?: boolean;
  comingSoon?: boolean;
  onNavigate?: () => void;
}) {
  const muted = locked || comingSoon;
  return (
    <Link
      href={href}
      title={
        comingSoon
          ? 'Coming soon'
          : locked
            ? 'PepGuide Pro required'
            : undefined
      }
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors',
        muted
          ? active
            ? 'bg-surface-secondary text-foreground-secondary/55'
            : 'text-foreground-secondary/45 hover:bg-surface-secondary/70 hover:text-foreground-secondary/60'
          : active
            ? 'bg-accent-muted text-accent'
            : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground',
      )}
    >
      <Icon className={cn('size-4 shrink-0', muted && 'opacity-60')} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {comingSoon ? (
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-secondary/80">
          Soon
        </span>
      ) : locked ? (
        <Lock className="size-3.5 shrink-0 opacity-70" />
      ) : null}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const { isAdmin } = useAdminAccess();
  const { isPro, loading: proLoading } = useProAccess();
  const proComingSoon = PRO_COMING_SOON && !isAdmin;
  const proLocked = !PRO_COMING_SOON && !proLoading && !isPro;

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          'fixed inset-0 z-40 bg-[color:var(--overlay)] transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeSidebar}
      />

      <aside
        className={cn(
          'flex h-full flex-col border-r border-border bg-surface',
          'fixed inset-y-0 left-0 z-50 w-[min(18.5rem,88vw)] shadow-[0_12px_40px_rgba(15,23,42,0.18)] transition-transform duration-200 ease-out',
          'lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <Link
            href="/chat"
            onClick={closeSidebar}
            className="flex min-w-0 flex-1 items-center justify-center rounded-[12px] px-2 py-2"
          >
            <Logo variant="full" size="sm" priority />
          </Link>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-9 shrink-0 lg:hidden"
            aria-label="Close menu"
            onClick={closeSidebar}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <nav className="flex shrink-0 flex-col gap-1">
            <div className="mb-1 flex items-center gap-1.5 px-3 pb-1 pt-0.5">
              <Sparkles className="size-3 text-accent" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-secondary">
                PepGuide Pro
              </p>
            </div>

            {PRO_NAV.map((item) => {
              const { href, label, icon } = item;
              const openToAll = 'openToAll' in item && item.openToAll;
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={active}
                  locked={!openToAll && proLocked}
                  comingSoon={!openToAll && proComingSoon}
                  onNavigate={closeSidebar}
                />
              );
            })}

            <div className="my-2 border-t border-border" />

          {MAIN_NAV.map(({ href, label, icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={active}
                onNavigate={closeSidebar}
              />
            );
          })}

          {user ? (
            <NavLink
              href="/settings"
              label="Settings"
              icon={Settings}
              active={
                pathname === '/settings' || pathname.startsWith('/settings/')
              }
              onNavigate={closeSidebar}
            />
          ) : null}

          {isAdmin ? (
              <NavLink
                href="/admin"
                label="Admin"
                icon={Shield}
                active={
                  pathname === '/admin' || pathname.startsWith('/admin/')
                }
                onNavigate={closeSidebar}
              />
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
              <p className="truncate text-xs text-foreground-secondary">
                {user.email}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                className="w-full"
                size="sm"
                onClick={() => {
                  closeSidebar();
                  openSignInModal(
                    'Sign in to chat with PepGuide AI and save research.',
                  );
                }}
              >
                Sign in
              </Button>
              <Button
                className="w-full"
                size="sm"
                variant="ghost"
                onClick={() => {
                  closeSidebar();
                  router.push('/welcome');
                }}
              >
                About PepGuide
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
