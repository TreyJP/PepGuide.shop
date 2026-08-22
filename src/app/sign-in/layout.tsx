import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sign in',
  description: 'Sign in to PepGuide.',
  path: '/sign-in',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
