import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'About PepGuide — Official Site',
  description:
    'Learn what PepGuide is: the official peptide research education platform with AI chat, peptide guides, and vendor discovery. PepGuide does not sell or prescribe peptides.',
  path: '/welcome',
  keywords: ['PepGuide', 'PepGuide.shop', 'about PepGuide', 'peptide research platform'],
});

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
