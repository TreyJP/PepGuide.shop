import { SITE_NAME, SITE_URL, SEO_SUPPORT_EMAIL } from '@/src/lib/seo/site';

type JsonLd = Record<string, unknown>;

export function jsonLdScript(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data);
}

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: ['PepGuide.shop', 'Pep Guide', 'PepGuide AI'],
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logowhitebackground.png`,
    image: `${SITE_URL}/brand/og-share.png`,
    email: SEO_SUPPORT_EMAIL,
    description:
      'PepGuide is an educational platform for peptide research information, guides, and vendor discovery. PepGuide does not sell or prescribe peptides.',
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['PepGuide.shop', 'Pep Guide'],
    url: SITE_URL,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/peptides?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http')
        ? item.path
        : `${SITE_URL}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/brand/logowhitebackground.png`,
      },
    },
    mainEntityOfPage: `${SITE_URL}${input.path}`,
  };
}

export function faqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
): JsonLd | null {
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
