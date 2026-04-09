import type { SiteCard } from '@/content/site';

export type MusicMetadata = {
  title: string;
  artist: string;
  artwork: string;
  provider: 'spotify' | 'apple';
  url: string;
};

async function getSpotifyMetadata(url: string): Promise<MusicMetadata> {
  const response = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Spotify metadata failed');
  }

  const data = (await response.json()) as {
    title: string;
    thumbnail_url: string;
  };

  const parts = data.title.split(' - ');

  return {
    title: parts[0] ?? data.title,
    artist: parts[1] ?? '',
    artwork: data.thumbnail_url,
    provider: 'spotify',
    url,
  };
}

async function getAppleMetadata(parsed: URL, url: string): Promise<MusicMetadata> {
  const lookupId =
    parsed.searchParams.get('i') ??
    parsed.pathname.split('/').filter(Boolean).at(-1);

  if (!lookupId) {
    throw new Error('Missing Apple Music id');
  }

  const response = await fetch(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(lookupId)}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error('Apple metadata failed');
  }

  const data = (await response.json()) as {
    results: Array<{
      trackName?: string;
      collectionName?: string;
      artistName: string;
      artworkUrl100: string;
    }>;
  };

  const track = data.results[0];
  if (!track) {
    throw new Error('Missing Apple track');
  }

  return {
    title: track.trackName ?? track.collectionName ?? 'Unknown',
    artist: track.artistName,
    artwork: track.artworkUrl100.replace('100x100', '600x600'),
    provider: 'apple',
    url,
  };
}

export async function getMusicMetadata(url: string): Promise<MusicMetadata | null> {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === 'open.spotify.com') {
      return await getSpotifyMetadata(url);
    }

    if (parsed.hostname === 'music.apple.com') {
      return await getAppleMetadata(parsed, url);
    }

    return null;
  } catch {
    return null;
  }
}

export async function getMusicMetadataMap(cards: SiteCard[]) {
  const musicCards = cards.filter((card) => card.type === 'music');
  const entries = await Promise.all(
    musicCards.map(async (card) => [card.id, await getMusicMetadata(card.url)] as const)
  );

  return Object.fromEntries(entries) as Record<string, MusicMetadata | null>;
}
