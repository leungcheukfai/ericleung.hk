import type { SiteCard } from '@/content/site';
import { getUrlPreview } from '@/server/link-previews';

export type YouTubeChannelMetadata = {
  title: string;
  artwork?: string;
  url: string;
};

function isYouTubeUrl(parsed: URL) {
  return parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com';
}

function normalizeYouTubeTitle(title?: string) {
  return title?.replace(/\s*-\s*YouTube$/i, '').trim();
}

export async function getYouTubeChannelMetadata(
  url: string
): Promise<YouTubeChannelMetadata | null> {
  try {
    const parsed = new URL(url);
    if (!isYouTubeUrl(parsed)) {
      return null;
    }

    const preview = await getUrlPreview(url);
    if (!preview?.title) {
      return null;
    }

    return {
      title: normalizeYouTubeTitle(preview.title) ?? preview.title,
      artwork: preview.image,
      url,
    };
  } catch {
    return null;
  }
}

export async function getYouTubeChannelMetadataMap(cards: SiteCard[]) {
  const youtubeCards = cards.filter(
    (card): card is Extract<SiteCard, { type: 'youtube-channels' }> =>
      card.type === 'youtube-channels'
  );

  const entries = await Promise.all(
    youtubeCards.map(async (card) => {
      const itemEntries = await Promise.all(
        card.items.map(async (item) => [item.href, await getYouTubeChannelMetadata(item.href)] as const)
      );

      return [card.id, Object.fromEntries(itemEntries)] as const;
    })
  );

  return Object.fromEntries(entries) as Record<
    string,
    Record<string, YouTubeChannelMetadata | null>
  >;
}
