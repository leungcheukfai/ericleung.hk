'use client';

import type { BookMetadata } from '@/server/book-metadata';
import type { MusicMetadata } from '@/server/music-metadata';
import type { SiteMetricsSummary } from '@/server/site-analytics';
import type { YouTubeChannelMetadata } from '@/server/youtube-channel-metadata';
import type { SiteCard } from '@/content/site';
import type { LinkPreviewMap } from './cards';
import dynamic from 'next/dynamic';

const SiteBentoGrid = dynamic(() => import('@/components/site/bento-grid'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4 md:gap-y-4">
      <div className="h-[176px] animate-pulse rounded-2xl border border-border bg-card/70" />
      <div className="h-[176px] animate-pulse rounded-2xl border border-border bg-card/70 md:col-span-2" />
      <div className="h-[176px] animate-pulse rounded-2xl border border-border bg-card/70" />
      <div className="h-[176px] animate-pulse rounded-2xl border border-border bg-card/70 md:col-span-2" />
      <div className="h-[176px] animate-pulse rounded-2xl border border-border bg-card/70 md:col-span-2" />
    </div>
  ),
});

export default function SiteGridShell(props: {
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
  return <SiteBentoGrid {...props} />;
}
