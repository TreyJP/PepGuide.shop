import type { Metadata } from 'next';

import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Peptide Calculator',
  description:
    'PepGuide peptide calculator tools for research organization. Educational use only — not medical dosing advice.',
  path: '/calculator',
  keywords: ['peptide calculator', 'peptide reconstitution', 'research calculator'],
});

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
