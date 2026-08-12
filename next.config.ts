import type { NextConfig } from 'next';

const firebaseProjectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || 'pepguide-c4a8d';
const firebaseAuthHost = `${firebaseProjectId}.firebaseapp.com`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep firebase-admin + jose outside the bundler — jwks-rsa/jose ESM
  // require() crashes the research API otherwise (ERR_REQUIRE_ESM).
  serverExternalPackages: ['firebase-admin', 'stripe', 'jose', 'jwks-rsa'],
  images: {
    // Logo uses quality={100}; required allow-list for Next.js 16+.
    qualities: [75, 100],
  },

  /**
   * Allow Google/Firebase auth popups to communicate with the opener window.
   * Do NOT apply COOP to /__/auth/* — that handler must finish the OAuth
   * redirect without opener isolation or the tab hangs after Google login.
   * @see https://github.com/firebase/firebase-js-sdk/issues/6199
   */
  async headers() {
    return [
      {
        source: '/((?!__/auth/|__/firebase/).*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  /**
   * Same-origin Firebase Auth helper proxy (required for Safari / iOS).
   * Pair with authDomain = www.pepguide.shop (see firebase config).
   * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
   */
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: `https://${firebaseAuthHost}/__/auth/:path*`,
      },
      {
        source: '/__/firebase/:path*',
        destination: `https://${firebaseAuthHost}/__/firebase/:path*`,
      },
    ];
  },
};

export default nextConfig;
