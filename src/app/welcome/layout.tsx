import type { Metadata } from 'next';

import { BRAND } from '@/src/constants/brand';
import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'About PepGuide',
  description: BRAND.description,
  path: '/welcome',
});

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
