'use client';

import { cn } from '@/lib/utils';
import type { SiteCard } from '@/content/site';
import type { BookMetadata } from '@/server/book-metadata';
import type { MusicMetadata } from '@/server/music-metadata';
import type { SiteMetricsSummary } from '@/server/site-analytics';
import type { YouTubeChannelMetadata } from '@/server/youtube-channel-metadata';
import type { LinkPreviewMap } from './cards';
import SiteCardView from './cards';

function getSizeClasses(card: SiteCard) {
  const sm = {
    '2x2': 'col-span-1 row-span-2',
    '2x4': 'col-span-1 row-span-4',
    '4x1': 'col-span-2 row-span-1',
    '4x2': 'col-span-2 row-span-2',
    '4x4': 'col-span-2 row-span-4',
    '4x5': 'col-span-2 row-span-5',
  }[card.size.sm];

  const md = {
    '2x2': 'md:col-span-1 md:row-span-2',
    '2x4': 'md:col-span-1 md:row-span-4',
    '4x1': 'md:col-span-2 md:row-span-1',
    '4x2': 'md:col-span-2 md:row-span-2',
    '4x4': 'md:col-span-2 md:row-span-4',
    '4x5': 'md:col-span-2 md:row-span-5',
  }[card.size.md];

  return cn(sm, md);
}

function getPositionClasses(card: SiteCard) {
  return cn(
    card.position?.sm &&
      '[grid-column-start:var(--sm-col-start)] [grid-row-start:var(--sm-row-start)]'
  );
}

function getPositionStyles(card: SiteCard, index: number) {
  const style: React.CSSProperties & Record<string, string> = {
    animationDelay: `${index * 75}ms`,
  };

  if (card.position?.sm) {
    style['--sm-col-start'] = String(card.position.sm.x + 1);
    style['--sm-row-start'] = String(card.position.sm.y + 1);
  }

  return style;
}

export default function SiteBentoGrid({
  cards,
  summary,
  previews,
  musicMetadataMap,
  youtubeChannelMetadataMap,
  bookMetadataMap,
  profileName,
  profileAvatar,
}: {
  cards: SiteCard[];
  summary: SiteMetricsSummary;
  previews: LinkPreviewMap;
  musicMetadataMap: Record<string, MusicMetadata | null>;
  youtubeChannelMetadataMap: Record<
    string,
    Record<string, YouTubeChannelMetadata | null>
  >;
  bookMetadataMap: Record<string, Record<string, BookMetadata | null>>;
  profileName: string;
  profileAvatar?: string;
}) {
  return (
    <div className="grid auto-rows-[76px] grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4 md:gap-y-4">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={cn(
            'min-h-0 min-w-0',
            getSizeClasses(card),
            getPositionClasses(card),
            'animate-fade-up'
          )}
          style={getPositionStyles(card, index)}
        >
          <SiteCardView
            card={card}
            summary={summary}
            previews={previews}
            musicMetadata={musicMetadataMap[card.id]}
            youtubeChannelMetadata={youtubeChannelMetadataMap[card.id]}
            bookMetadata={bookMetadataMap[card.id]}
            profileName={profileName}
            profileAvatar={profileAvatar}
          />
        </div>
      ))}
    </div>
  );
}
