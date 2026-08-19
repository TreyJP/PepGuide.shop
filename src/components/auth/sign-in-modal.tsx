'use client';

import { useEffect } from 'react';

import '@/src/components/auth/auth-forms.css';
import { InAppBrowserGate } from '@/src/components/auth/in-app-browser-gate';
import { SignInForm } from '@/src/components/auth/sign-in-form';
import { SignUpForm } from '@/src/components/auth/sign-up-form';
import { ModalShell } from '@/src/components/ui/modal-shell';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

const DEFAULT_SIGN_IN_MESSAGE =
  'Sign in to start researching with PepGuide AI and save your chats.';
const DEFAULT_SIGN_UP_MESSAGE =
  'Free access to chat, bookmarks, vendor reviews, and more.';

const SIGN_UP_PERKS = ['AI chat', 'Bookmarks', 'Vendor reviews'] as const;

export function AuthModal() {
  const user = useAuthStore((state) => state.user);
  const open = useUiStore((state) => state.authModalOpen);
  const mode = useUiStore((state) => state.authModalMode);
  const message = useUiStore((state) => state.authModalMessage);
  const closeAuthModal = useUiStore((state) => state.closeAuthModal);
  const setAuthModalMode = useUiStore((state) => state.setAuthModalMode);

  useEffect(() => {
    if (user && open) closeAuthModal();
  }, [user, open, closeAuthModal]);

  const isSignUp = mode === 'sign-up';
  const title = isSignUp ? 'Create your account' : 'Sign in to continue';
  const description =
    message ||
    (isSignUp ? DEFAULT_SIGN_UP_MESSAGE : DEFAULT_SIGN_IN_MESSAGE);

  return (
    <>
      <ModalShell
        open={open}
        title={title}
        titleId="auth-modal-title"
        eyebrow={isSignUp ? 'Join PepGuide' : 'Welcome back'}
        description={description}
        onClose={closeAuthModal}
        className={cn(isSignUp ? 'max-w-lg' : 'max-w-md')}
        headerExtra={
          isSignUp ? (
            <div className="auth-modal__perks">
              {SIGN_UP_PERKS.map((perk) => (
                <span key={perk} className="auth-modal__perk">
                  <span className="auth-modal__perk-dot" aria-hidden />
                  {perk}
                </span>
              ))}
            </div>
          ) : null
        }
        footer={
          <p className="text-center text-sm text-foreground-secondary">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-semibold text-accent hover:underline"
                  onClick={() => setAuthModalMode('sign-in')}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="font-semibold text-accent hover:underline"
                  onClick={() => setAuthModalMode('sign-up')}
                >
                  Create one
                </button>
              </>
            )}
          </p>
        }
      >
        <div className="auth-modal__tabs" role="tablist" aria-label="Auth mode">
          {(['sign-in', 'sign-up'] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              data-active={mode === item}
              className="auth-modal__tab"
              onClick={() => setAuthModalMode(item)}
            >
              {item === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {mode === 'sign-in' ? (
          <SignInForm onSuccess={closeAuthModal} />
        ) : (
          <SignUpForm onSuccess={closeAuthModal} />
        )}
      </ModalShell>

      {open ? <InAppBrowserGate /> : null}
    </>
  );
}

/** @deprecated Use AuthModal — kept for existing imports. */
export const SignInModal = AuthModal;
