'use client';

import { useEffect } from 'react';

import { analyticsService } from '@/src/services/analytics';

/** Lightweight SEO engagement signal — no health/PII payload. */
export function SeoEngagementBeacon({
  contentType,
  slug,
}: {
  contentType: 'peptide' | 'guide' | 'vendor' | 'hub' | 'home';
  slug: string;
}) {
  useEffect(() => {
    analyticsService.logEvent('seo_page_view', {
      content_type: contentType,
      slug,
    });
  }, [contentType, slug]);

  return null;
}
