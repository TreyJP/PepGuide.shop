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
   * Same-origin Firebase Auth helper proxy (required for Safari / iOS).
   * Without this, signInWithRedirect/popup helper storage is third-party and gets blocked.
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
