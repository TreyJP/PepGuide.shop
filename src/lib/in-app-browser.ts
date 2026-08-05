/**
 * Detect embedded / in-app browsers where Google + Firebase auth often fails
 * (Discord, Instagram, Facebook, TikTok, LinkedIn, etc.).
 */
export function isInAppBrowser(userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  const ua = userAgent || '';
  return (
    /\bDiscord\b/i.test(ua) ||
    /\bFBAN\b|\bFBAV\b|\bFB_IAB\b/i.test(ua) ||
    /\bInstagram\b/i.test(ua) ||
    /\bLine\b/i.test(ua) ||
    /\bLinkedInApp\b/i.test(ua) ||
    /\bTikTok\b|\bmusical_ly\b|\bBytedanceWebview\b/i.test(ua) ||
    /\bSnapchat\b/i.test(ua) ||
    /\bTwitter\b|\bX\.com\b/i.test(ua) ||
    /\bMicroMessenger\b/i.test(ua) || // WeChat
    /\bWV\b/i.test(ua) && /Android/i.test(ua) // generic Android WebView
  );
}

export function inAppBrowserName(userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''): string {
  const ua = userAgent || '';
  if (/\bDiscord\b/i.test(ua)) return 'Discord';
  if (/\bInstagram\b/i.test(ua)) return 'Instagram';
  if (/\bFBAN\b|\bFBAV\b|\bFB_IAB\b/i.test(ua)) return 'Facebook';
  if (/\bTikTok\b|\bmusical_ly\b/i.test(ua)) return 'TikTok';
  if (/\bLinkedInApp\b/i.test(ua)) return 'LinkedIn';
  return 'this in-app browser';
}

/** Best-effort handoff to the system browser. Often still blocked inside Discord. */
export function tryOpenInSystemBrowser(url = typeof window !== 'undefined' ? window.location.href : ''): boolean {
  if (typeof window === 'undefined' || !url) return false;

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  try {
    if (isIOS) {
      // Some iOS webviews honor the x-safari-https scheme.
      const safariUrl = url.replace(/^https:/i, 'x-safari-https:').replace(/^http:/i, 'x-safari-http:');
      window.location.href = safariUrl;
      return true;
    }

    if (isAndroid) {
      const parsed = new URL(url);
      const intent = `intent://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}#Intent;scheme=${parsed.protocol.replace(':', '')};action=android.intent.action.VIEW;end`;
      window.location.href = intent;
      return true;
    }
  } catch {
    // fall through
  }

  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  } catch {
    return false;
  }
}

export async function copyCurrentUrl(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
}
