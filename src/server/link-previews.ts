import type { SiteCard } from '@/content/site';
import { unstable_cache } from 'next/cache';

type UrlPreview = {
  title?: string;
  description?: string;
  image?: string;
};

function extractMetaTag(html: string, property: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  return html.match(pattern)?.[1];
}

function extractTitle(html: string) {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
}

async function fetchPreview(url: string): Promise<UrlPreview | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; ericleung.hk preview fetcher; +https://ericleung.hk)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      return null;
    }

    const html = await response.text();
    const title =
      extractMetaTag(html, 'og:title') ??
      extractMetaTag(html, 'twitter:title') ??
      extractTitle(html);
    const description =
      extractMetaTag(html, 'og:description') ??
      extractMetaTag(html, 'twitter:description') ??
      extractMetaTag(html, 'description');
    const image =
      extractMetaTag(html, 'og:image') ?? extractMetaTag(html, 'twitter:image');

    return {
      title,
      description,
      image,
    };
  } catch {
    return null;
  }
}

const getCachedPreview = unstable_cache(
  async (url: string) => fetchPreview(url),
  ['ericleung-hk-url-preview'],
  { revalidate: 3600 }
);

export function getUrlPreview(url: string) {
  return getCachedPreview(url);
}

export async function getLinkPreviews(cards: SiteCard[]) {
  const linkCards = cards.filter((card) => card.type === 'link');
  const previews = await Promise.all(
    linkCards.map(
      async (card) => [card.id, await getCachedPreview(card.href)] as const
    )
  );

  return Object.fromEntries(previews) as Record<string, UrlPreview | null>;
}
