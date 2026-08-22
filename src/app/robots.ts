import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/src/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/settings',
          '/settings/',
          '/sign-in',
          '/sign-up',
          '/forgot-password',
          '/verify-email',
          '/onboarding',
          '/billing/',
          '/subscription',
          '/campaigns',
          '/campaigns/',
          '/affiliates',
          '/affiliates/',
          '/saved',
          '/saved/',
          '/chat',
          '/chat/',
          '/r/',
          '/ref/',
          '/pro/',
          '/library',
          '/library/',
          '/compare',
          '/cycle',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
