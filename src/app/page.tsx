import type { Metadata } from 'next';

import { BrandHomeRedirect } from '@/src/components/seo/brand-home-redirect';
import { JsonLd } from '@/src/components/seo/seo-shell';
import { BRAND } from '@/src/constants/brand';
import {
  organizationJsonLd,
  websiteJsonLd,
} from '@/src/lib/seo/json-ld';
import { buildPageMetadata } from '@/src/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'PepGuide',
  description:
    'PepGuide is the official peptide research education platform — AI research chat, peptide guides, evidence summaries, and vendor discovery. For educational use only.',
  path: '/',
  keywords: [
    'PepGuide',
    'PepGuide.shop',
    'Pep Guide',
    'peptide research',
    'peptide education',
    'peptide guides',
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      {/* Crawlable brand copy if JS is delayed; humans go to /chat immediately. */}
      <section className="sr-only" aria-hidden={false}>
        <h1>PepGuide</h1>
        <p>
          PepGuide ({BRAND.name}) at pepguide.shop is an educational platform for peptide
          research information, peptide guides, and third-party vendor discovery. PepGuide does
          not sell or prescribe peptides.
        </p>
        <p>{BRAND.description}</p>
        <ul>
          <li>
            <a href="/chat">Open PepGuide AI chat</a>
          </li>
          <li>
            <a href="/peptides">Peptide directory</a>
          </li>
          <li>
            <a href="/guides">Educational guides</a>
          </li>
          <li>
            <a href="/welcome">About PepGuide</a>
          </li>
        </ul>
      </section>
      <BrandHomeRedirect />
    </>
  );
}
