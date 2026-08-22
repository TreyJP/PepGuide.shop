import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Verify email',
  description: 'Verify your PepGuide email.',
  path: '/verify-email',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
