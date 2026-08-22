import type { MetadataRoute } from 'next';

import { SEO_GUIDES } from '@/src/data/seo/guides';
import { getSeoVendors } from '@/src/data/seo/vendors';
import { getIndexablePeptides } from '@/src/lib/seo/peptides';
import { SITE_URL } from '@/src/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/peptides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/vendors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/welcome`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const peptides = getIndexablePeptides().map((peptide) => ({
    url: `${SITE_URL}/peptides/${peptide.id}`,
    lastModified: peptide.lastReviewedAt
      ? new Date(peptide.lastReviewedAt)
      : now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const guides = SEO_GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  const vendors = getSeoVendors().map((vendor) => ({
    url: `${SITE_URL}/vendors/${vendor.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...peptides, ...guides, ...vendors];
}
