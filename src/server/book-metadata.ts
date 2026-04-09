import type { SiteCard } from '@/content/site';

export type BookMetadata = {
  title: string;
  subtitle?: string;
  artwork?: string;
  url: string;
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTextById(html: string, id: string) {
  const match = html.match(
    new RegExp(`id=["']${id}["'][^>]*>\\s*([^<]+?)\\s*<`, 'i')
  )?.[1];

  return match ? decodeHtmlEntities(match) : undefined;
}

function extractBylineAuthors(html: string) {
  const byline = html.match(/<div id="bylineInfo"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if (!byline) {
    return undefined;
  }

  const matches = Array.from(
    byline.matchAll(
      /<span class="author[^"]*"[\s\S]*?<a [^>]*>([^<]+)<\/a>[\s\S]*?<span class="a-color-secondary">\(([^<]+)\)<\/span>/gi
    )
  );

  const authors = matches
    .flatMap((match) => {
      const name = match[1];
      const role = match[2];

      if (!name || !role || !/author/i.test(role)) {
        return [];
      }

      return [decodeHtmlEntities(name)];
    });

  const names = authors.length
    ? authors
    : Array.from(
        byline.matchAll(/<a class="a-link-normal" [^>]*>([^<]+)<\/a>/gi)
      ).flatMap((match) => {
        const name = match[1];
        return name ? [decodeHtmlEntities(name)] : [];
      });

  const uniqueNames = Array.from(new Set(names));
  if (uniqueNames.length === 0) {
    return undefined;
  }

  if (uniqueNames.length <= 2) {
    return uniqueNames.join(', ');
  }

  return `${uniqueNames.slice(0, 2).join(', ')} +${uniqueNames.length - 2}`;
}

function extractDynamicImage(html: string) {
  const dynamicImage = html.match(/data-a-dynamic-image="([^"]+)"/i)?.[1];
  if (dynamicImage) {
    const decoded = decodeHtmlEntities(dynamicImage);
    const urls = Array.from(decoded.matchAll(/https:\/\/[^"]+/g), (match) => match[0]);
    if (urls.length > 0) {
      return urls[urls.length - 1];
    }
  }

  const largeImage = html.match(/"large":"([^"]+)"/i)?.[1];
  return largeImage ? decodeHtmlEntities(largeImage) : undefined;
}

async function fetchBookMetadata(url: string): Promise<BookMetadata | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; ericleung.hk preview fetcher; +https://ericleung.hk)',
      },
      next: { revalidate: 3600 },
      redirect: 'follow',
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      return null;
    }

    const html = await response.text();
    const title = extractTextById(html, 'productTitle');
    if (!title) {
      return null;
    }

    return {
      title,
      subtitle:
        extractBylineAuthors(html) ??
        extractTextById(html, 'productSubtitle'),
      artwork: extractDynamicImage(html),
      url: response.url,
    };
  } catch {
    return null;
  }
}

export async function getBookMetadataMap(cards: SiteCard[]) {
  const bookCards = cards.filter(
    (card): card is Extract<SiteCard, { type: 'books' }> => card.type === 'books'
  );

  const entries = await Promise.all(
    bookCards.map(async (card) => {
      const itemEntries = await Promise.all(
        card.items.map(async (item) => [item.href, await fetchBookMetadata(item.href)] as const)
      );

      return [card.id, Object.fromEntries(itemEntries)] as const;
    })
  );

  return Object.fromEntries(entries) as Record<
    string,
    Record<string, BookMetadata | null>
  >;
}
