'use client';

import { sizeToGrid } from '@/components/bento/sizes';
import type { SiteCard } from '@/content/site';
import type { BookMetadata } from '@/server/book-metadata';
import type { MusicMetadata } from '@/server/music-metadata';
import type { SiteMetricsSummary } from '@/server/site-analytics';
import type { YouTubeChannelMetadata } from '@/server/youtube-channel-metadata';
import type { LinkPreviewMap } from './cards';
import SiteCardView from './cards';
import { useMemo } from 'react';
import type React from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  type Layouts,
  Responsive,
  type ResponsiveProps,
  WidthProvider,
} from 'react-grid-layout';

type Breakpoint = 'sm' | 'md';

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function collides(a: LayoutItem, b: LayoutItem) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function canPlace(
  placed: LayoutItem[],
  candidate: LayoutItem,
  cols: number
) {
  if (candidate.x < 0 || candidate.y < 0 || candidate.x + candidate.w > cols) {
    return false;
  }

  return !placed.some((item) => collides(item, candidate));
}

function autoPlaceItem(
  placed: LayoutItem[],
  w: number,
  h: number,
  cols: number
) {
  for (let y = 0; y < 600; y++) {
    for (let x = 0; x <= cols - w; x++) {
      const candidate = { i: '', x, y, w, h };
      if (canPlace(placed, candidate, cols)) {
        return { x, y };
      }
    }
  }

  const maxY = placed.reduce((value, item) => Math.max(value, item.y + item.h), 0);
  return { x: 0, y: maxY };
}

function buildBreakpointLayout(
  cards: SiteCard[],
  breakpoint: Breakpoint,
  cols: number
) {
  const placed: LayoutItem[] = [];

  for (const card of cards) {
    const size = sizeToGrid(card.size[breakpoint], breakpoint);
    const h = Math.round(size.h * 2);
    const explicitPosition = card.position?.[breakpoint];
    const explicit = explicitPosition
      ? {
          x: explicitPosition.x,
          y: Math.round(explicitPosition.y * 2),
        }
      : null;

    const position =
      explicit &&
      canPlace(placed, { i: card.id, x: explicit.x, y: explicit.y, w: size.w, h }, cols)
        ? explicit
        : autoPlaceItem(placed, size.w, h, cols);

    placed.push({
      i: card.id,
      x: position.x,
      y: position.y,
      w: size.w,
      h,
    });
  }

  return placed.map((item) => ({
    ...item,
    y: item.y / 2,
    h: item.h / 2,
  }));
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
  const ResponsiveGridLayout = useMemo(
    () => WidthProvider(Responsive) as React.ComponentType<ResponsiveProps>,
    []
  );

  const layouts: Layouts = useMemo(() => {
    const smLayout = buildBreakpointLayout(cards, 'sm', 2);
    const mdLayout = buildBreakpointLayout(cards, 'md', 4);

    return {
      xxs: smLayout,
      xs: smLayout,
      sm: smLayout,
      md: mdLayout,
      lg: mdLayout,
    };
  }, [cards]);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      measureBeforeMount
      cols={{ xxs: 2, xs: 2, sm: 2, md: 4, lg: 4 }}
      breakpoints={{ lg: 800, md: 600, sm: 300, xs: 0, xxs: 0 }}
      rowHeight={176}
      margin={[24, 24]}
      containerPadding={[0, 0]}
      isDraggable={false}
      isResizable={false}
      compactType="vertical"
      preventCollision={false}
    >
      {cards.map((card, index) => (
        <div key={card.id}>
          <div
            className="h-full w-full animate-fade-up"
            style={{ animationDelay: `${index * 75}ms` }}
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
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
