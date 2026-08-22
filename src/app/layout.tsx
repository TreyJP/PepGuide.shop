import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';

import { Providers } from '@/src/components/providers';
import { BRAND } from '@/src/constants/brand';
import {
  JsonLd,
} from '@/src/components/seo/seo-shell';
import {
  organizationJsonLd,
  websiteJsonLd,
} from '@/src/lib/seo/json-ld';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/src/lib/seo/site';

import './globals.css';
import './chat-designs.css';

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} | Peptide Research Education`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  icons: {
    icon: [
      { url: '/brand/faviconpepguidelogo.png', type: 'image/png' },
      { url: '/brand/faviconpepguidelogo.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/brand/faviconpepguidelogo.png',
    apple: [
      {
        url: '/brand/faviconpepguidelogo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: BRAND.name,
    title: `${BRAND.name} | Peptide Research Education`,
    description: BRAND.description,
    images: [
      {
        url: DEFAULT_OG_IMAGE.url,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
        alt: DEFAULT_OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} | Peptide Research Education`,
    description: BRAND.description,
    images: [DEFAULT_OG_IMAGE.url],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable}`}
    >
      <body className={`${sans.className} antialiased`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
