import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Admin',
  description: 'PepGuide admin area.',
  path: '/admin',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
