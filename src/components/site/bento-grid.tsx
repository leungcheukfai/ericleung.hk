'use client';

import type { SiteCard } from '@/content/site';
import { cn } from '@/lib/utils';
import type { BookMetadata } from '@/server/book-metadata';
import type { MusicMetadata } from '@/server/music-metadata';
import type { SiteMetricsSummary } from '@/server/site-analytics';
import type { YouTubeChannelMetadata } from '@/server/youtube-channel-metadata';
import type { CSSProperties } from 'react';
import {
  SiteBreakpointProvider,
  type SiteRenderBreakpoint,
} from './breakpoint-context';
import type { LinkPreviewMap } from './cards';
import SiteCardView from './cards';

const SIZE_CLASS_MAP = {
  '2x2': 'col-span-1 row-span-2',
  '2x4': 'col-span-1 row-span-4',
  '4x1': 'col-span-2 row-span-1',
  '4x2': 'col-span-2 row-span-2',
  '4x4': 'col-span-2 row-span-4',
  '4x5': 'col-span-2 row-span-5',
} as const;

function getSizeClasses(
  card: SiteCard,
  forcedBreakpoint?: SiteRenderBreakpoint | null
) {
  if (forcedBreakpoint === 'sm') {
    return SIZE_CLASS_MAP[card.size.sm];
  }

  if (forcedBreakpoint === 'md') {
    return SIZE_CLASS_MAP[card.size.md];
  }

  const sm = SIZE_CLASS_MAP[card.size.sm];
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

function getPositionClasses(
  card: SiteCard,
  forcedBreakpoint?: SiteRenderBreakpoint | null
) {
  if (forcedBreakpoint === 'md') {
    return '';
  }

  return cn(
    card.position?.sm &&
      '[grid-column-start:var(--sm-col-start)] [grid-row-start:var(--sm-row-start)]'
  );
}

function getPositionStyles(
  card: SiteCard,
  index: number,
  forcedBreakpoint?: SiteRenderBreakpoint | null
) {
  const style: CSSProperties & Record<string, string> = {
    animationDelay: `${index * 75}ms`,
  };

  if (forcedBreakpoint !== 'md' && card.position?.sm) {
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
  forcedBreakpoint,
  animate = true,
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
  forcedBreakpoint?: SiteRenderBreakpoint | null;
  animate?: boolean;
}) {
  return (
    <SiteBreakpointProvider breakpoint={forcedBreakpoint}>
      <div
        className={cn(
          'grid auto-rows-[76px] gap-x-4',
          forcedBreakpoint === 'md'
            ? 'grid-cols-4 gap-y-4'
            : 'grid-cols-2 gap-y-3',
          !forcedBreakpoint && 'md:grid-cols-4 md:gap-y-4'
        )}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={cn(
              'min-h-0 min-w-0',
              getSizeClasses(card, forcedBreakpoint),
              getPositionClasses(card, forcedBreakpoint),
              animate && 'animate-fade-up'
            )}
            style={getPositionStyles(card, index, forcedBreakpoint)}
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
    </SiteBreakpointProvider>
  );
}
