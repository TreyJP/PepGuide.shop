import type { Metadata } from 'next';

import { BRAND } from '@/src/constants/brand';
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from '@/src/lib/seo/site';

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  /** Path starting with /, e.g. /peptides/bpc-157 */
  path: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  type?: 'website' | 'article';
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
};

function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Shared metadata builder for indexable (and intentionally noindex) pages. */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const imageUrl = absoluteUrl(image.url);

  const absoluteTitle =
    input.title === SITE_NAME || input.title.includes(`| ${SITE_NAME}`)
      ? input.title === SITE_NAME
        ? `${SITE_NAME} | Peptide Research Education`
        : input.title
      : `${input.title} | ${SITE_NAME}`;

  return {
    title: { absolute: absoluteTitle },
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: url,
    },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type: input.type ?? 'website',
      locale: 'en_US',
      url,
      siteName: SITE_NAME,
      title: absoluteTitle,
      description: input.description,
      images: [
        {
          url: imageUrl,
          width: image.width ?? DEFAULT_OG_IMAGE.width,
          height: image.height ?? DEFAULT_OG_IMAGE.height,
          alt: image.alt ?? BRAND.name,
        },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle,
      description: input.description,
      images: [imageUrl],
    },
  };
}

export const NOINDEX_METADATA = buildPageMetadata({
  title: 'Private',
  description: BRAND.description,
  path: '/',
  noIndex: true,
});
