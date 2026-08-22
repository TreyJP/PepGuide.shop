import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Library',
  description:
    'Interactive PepGuide peptide library. Educational SEO profiles live at /peptides.',
  path: '/library',
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
