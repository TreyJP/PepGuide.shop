import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';

import { Providers } from '@/src/components/providers';
import { BRAND } from '@/src/constants/brand';

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
  metadataBase: new URL('https://www.pepguide.shop'),
  title: {
    default: BRAND.name,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  icons: {
    icon: [
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-light.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.pepguide.shop',
    siteName: BRAND.name,
    title: BRAND.name,
    description: BRAND.description,
    images: [
      {
        url: '/brand/og-share.png',
        width: 1200,
        height: 630,
        alt: BRAND.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.name,
    description: BRAND.description,
    images: ['/brand/og-share.png'],
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
