export type ProExplainerVideoSource =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'vimeo'; embedUrl: string }
  | { kind: 'file'; src: string };

/** Parse YouTube / Vimeo / direct media URLs for the Pro explainer slot. */
export function parseProExplainerVideoUrl(
  raw: string | undefined | null,
): ProExplainerVideoSource | null {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(value, 'https://www.pepguide.shop');
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id) {
        return {
          kind: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        };
      }
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const fromQuery = url.searchParams.get('v');
      const parts = url.pathname.split('/').filter(Boolean);
      const fromPath =
        parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live'
          ? parts[1]
          : null;
      const id = fromQuery || fromPath;
      if (id) {
        return {
          kind: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        };
      }
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = host === 'player.vimeo.com' ? parts[1] : parts[0];
      if (id && /^\d+$/.test(id)) {
        return {
          kind: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${id}`,
        };
      }
    }

    // Relative public path or absolute file URL
    if (
      value.startsWith('/') ||
      host === 'pepguide.shop' ||
      /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url.pathname)
    ) {
      return { kind: 'file', src: value.startsWith('/') ? value : url.href };
    }
  } catch {
    if (value.startsWith('/')) {
      return { kind: 'file', src: value };
    }
  }

  return null;
}
