'use client';

import type { SettingsDesignViewProps } from '@/src/components/settings/designs/types';

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function SetDesignAtlas({
  user,
  notice,
  deleting,
  billingBusy,
  billingError,
  onSignOut,
  onDeleteAccount,
  onSubscribePro,
  onManageBilling,
}: SettingsDesignViewProps) {
  const access = user.subscriptionTier === 'pro' ? 'Pro' : 'Free';
  const isPro = access === 'Pro';

  return (
    <div className="set-atlas">
      <header className="set-atlas__hero set-rise">
        <h1>Settings</h1>
      </header>

      <div className="set-atlas__grid">
        <aside className="set-atlas__identity set-rise" style={{ animationDelay: '40ms' }}>
          <span className="set-mono" aria-hidden>
            {initial(user.displayName)}
          </span>
          <h2 title={user.displayName}>{user.displayName}</h2>
          <p title={user.email}>{user.email}</p>
          <span className="set-chip">{access}</span>
          <button type="button" className="set-btn set-btn--ghost" onClick={onSignOut}>
            Sign out
          </button>
        </aside>

        <div className="set-atlas__main">
          <section className="set-atlas__panel set-rise" style={{ animationDelay: '80ms' }}>
            <h3>Account</h3>
            <ul>
              <li>
                <span>Display name</span>
                <strong>{user.displayName}</strong>
              </li>
              <li>
                <span>Email</span>
                <strong>{user.email}</strong>
              </li>
              <li>
                <span>Access tier</span>
                <strong>{isPro ? 'PepGuide Pro' : 'Free'}</strong>
              </li>
            </ul>
            <div className="set-atlas__billing">
              {isPro ? (
                <button
                  type="button"
                  className="set-btn set-btn--navy"
                  disabled={billingBusy}
                  onClick={onManageBilling}
                >
                  {billingBusy ? 'Opening…' : 'Manage billing'}
                </button>
              ) : (
                <button
                  type="button"
                  className="set-btn set-btn--navy"
                  disabled={billingBusy}
                  onClick={onSubscribePro}
                >
                  Upgrade to PepGuide Pro
                </button>
              )}
              {billingError ? (
                <p className="set-atlas__billing-error">{billingError}</p>
              ) : null}
            </div>
          </section>

          <section className="set-atlas__panel set-rise" style={{ animationDelay: '120ms' }}>
            <h3>Privacy</h3>
            <p>{notice}</p>
            <p className="set-atlas__meta">
              Retention window: {user.dataRetentionDays ?? 365} days
            </p>
            <button
              type="button"
              className="set-btn set-btn--danger"
              disabled={deleting}
              onClick={onDeleteAccount}
            >
              {deleting ? 'Deleting…' : 'Delete account'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
