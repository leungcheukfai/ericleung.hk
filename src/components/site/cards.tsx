'use client';

import { AppleMusic } from '@/components/icons/apple-music';
import { Spotify } from '@/components/icons/spotify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  SiteBooksCard,
  SiteCalendarCard,
  SiteCard,
  SiteCountdownCard,
  SiteEmailCollectCard,
  SiteFavoritesCard,
  SiteGitHubCard,
  SiteImageCard,
  SiteLinkCard,
  SiteMapCard,
  SiteMusicCard,
  SitePodcastsCard,
  SiteTwitterCard,
  SiteViewsCard,
  SiteWeatherCard,
  SiteYouTubeChannelsCard,
} from '@/content/site';
import type { BookMetadata } from '@/server/book-metadata';
import type { MusicMetadata } from '@/server/music-metadata';
import type { SiteMetricsSummary } from '@/server/site-analytics';
import type { YouTubeChannelMetadata } from '@/server/youtube-channel-metadata';
import {
  Calendar,
  AtSign,
  BookOpen,
  Globe,
  ExternalLink,
  Eye,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Repeat2,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { BiLogoTelegram } from 'react-icons/bi';
import { BsDiscord, BsTwitterX } from 'react-icons/bs';
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitch,
  FaYoutube,
} from 'react-icons/fa';
import { FaThreads, FaXTwitter } from 'react-icons/fa6';
import { PiApplePodcastsLogoFill } from 'react-icons/pi';

export type LinkPreview = {
  title?: string;
  description?: string;
  image?: string;
};

export type LinkPreviewMap = Record<string, LinkPreview | null>;

type GitHubStats = {
  avatar: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  stars: number;
};

type TweetData = {
  text: string;
  createdAt: string;
  user: {
    name: string;
    screenName: string;
    profileImageUrl: string;
  };
  favoriteCount: number;
  retweetCount: number;
  replyCount: number;
  photos: { url: string; width: number; height: number }[];
};

type WeatherData = {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

const TWEET_URL_RE = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;

function trackCardClick(cardId: string, href: string) {
  const payload = JSON.stringify({ cardId, href });
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/track/click',
      new Blob([payload], { type: 'application/json' })
    );
    return;
  }

  void fetch('/api/track/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  });
}

function formatCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

function formatTweetDate(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 1) {
    return `${Math.floor(diff / (1000 * 60))}m`;
  }
  if (hours < 24) {
    return `${Math.floor(hours)}h`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function chunkItems<T>(items: T[], size: number) {
  if (size <= 0) {
    return [items];
  }

  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }

  return pages;
}

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group relative z-0 h-full w-full select-none overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
}

function PagedDots({
  pageCount,
  currentPage,
  onSelect,
}: {
  pageCount: number;
  currentPage: number;
  onSelect: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="mt-0.5 flex items-center justify-center gap-1 md:mt-1">
      {Array.from({ length: pageCount }, (_, index) => {
        const active = index === currentPage;

        return (
          <button
            key={index}
            type="button"
            aria-label={`Show page ${index + 1}`}
            aria-pressed={active}
            className="inline-flex min-h-9 min-w-9 touch-manipulation items-center justify-center rounded-full md:min-h-[44px] md:min-w-[44px]"
            onClick={() => onSelect(index)}
          >
            <span
              className={cn(
                'block h-2 rounded-full transition-all',
                active
                  ? 'w-5 bg-primary'
                  : 'w-2 bg-border hover:bg-muted-foreground/40'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function PagedRows<T>({
  items,
  renderItem,
  getKey,
  mobileItemsPerPage = 3,
  desktopItemsPerPage = 4,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string;
  mobileItemsPerPage?: number;
  desktopItemsPerPage?: number;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 600px)');
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  const itemsPerPage = isDesktop ? desktopItemsPerPage : mobileItemsPerPage;
  const pages = useMemo(
    () => chunkItems(items, itemsPerPage),
    [items, itemsPerPage]
  );
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(0);
    }
  }, [currentPage, pages.length]);

  return (
    <>
      <div className="mt-1 flex-1 overflow-hidden md:mt-1.5">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((pageItems, pageIndex) => (
            <div key={pageIndex} className="w-full shrink-0">
              <div className="space-y-1 md:space-y-1.5">
                {pageItems.map((item, itemIndex) => {
                  const absoluteIndex = pageIndex * itemsPerPage + itemIndex;
                  return (
                    <div key={getKey(item, absoluteIndex)}>
                      {renderItem(item, absoluteIndex)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PagedDots
        pageCount={pages.length}
        currentPage={currentPage}
        onSelect={setCurrentPage}
      />
    </>
  );
}

type PlatformInfo = {
  icon: React.ReactNode;
  largeIcon: React.ReactNode;
  bg: string;
  actionLabel: string;
  actionClassName?: string;
};

const PLATFORM_MAP: Record<string, PlatformInfo> = {
  twitter: {
    icon: <BsTwitterX size={20} className="text-foreground" />,
    largeIcon: <BsTwitterX size={32} className="text-foreground" />,
    bg: 'bg-foreground/5',
    actionLabel: 'Follow',
    actionClassName:
      'rounded-full bg-foreground text-background hover:bg-foreground/90',
  },
  linkedin: {
    icon: <FaLinkedinIn size={20} className="text-[#0A66C2]" />,
    largeIcon: <FaLinkedinIn size={32} className="text-[#0A66C2]" />,
    bg: 'bg-[#0A66C2]/5',
    actionLabel: 'Connect',
    actionClassName: 'rounded-full bg-[#0A66C2] text-white hover:bg-[#004182]',
  },
  threads: {
    icon: <FaThreads size={20} className="text-foreground" />,
    largeIcon: <FaThreads size={32} className="text-foreground" />,
    bg: 'bg-foreground/5',
    actionLabel: 'Follow',
    actionClassName:
      'rounded-full bg-foreground text-background hover:bg-foreground/90',
  },
  github: {
    icon: <FaGithub size={20} className="text-foreground" />,
    largeIcon: <FaGithub size={32} className="text-foreground" />,
    bg: 'bg-gray-500/5',
    actionLabel: 'Follow',
    actionClassName: 'rounded-full',
  },
  instagram: {
    icon: <FaInstagram size={20} className="text-[#F56040]" />,
    largeIcon: <FaInstagram size={32} className="text-[#F56040]" />,
    bg: 'bg-[#F56040]/5',
    actionLabel: 'Follow',
    actionClassName:
      'rounded-full bg-foreground text-background hover:bg-foreground/90',
  },
  twitch: {
    icon: <FaTwitch size={20} className="text-[#9146FF]" />,
    largeIcon: <FaTwitch size={32} className="text-[#9146FF]" />,
    bg: 'bg-[#9146FF]/5',
    actionLabel: 'Follow',
    actionClassName: 'rounded-full bg-[#9146FF] text-white hover:bg-[#7c3aed]',
  },
  telegram: {
    icon: <BiLogoTelegram size={24} className="text-[#0088CC]" />,
    largeIcon: <BiLogoTelegram size={36} className="text-[#0088CC]" />,
    bg: 'bg-[#0088CC]/5',
    actionLabel: 'Message',
    actionClassName: 'rounded-full',
  },
  discord: {
    icon: <BsDiscord size={24} className="text-[#5A65EA]" />,
    largeIcon: <BsDiscord size={36} className="text-[#5A65EA]" />,
    bg: 'bg-[#5A65EA]/5',
    actionLabel: 'Join',
    actionClassName: 'rounded-full bg-[#5A65EA] text-white hover:bg-[#4752c4]',
  },
  youtube: {
    icon: <FaYoutube size={20} className="text-[#FF0000]" />,
    largeIcon: <FaYoutube size={32} className="text-[#FF0000]" />,
    bg: 'bg-[#FF0000]/5',
    actionLabel: 'Subscribe',
    actionClassName: 'rounded-full bg-[#FF0000] text-white hover:bg-[#cc0000]',
  },
  email: {
    icon: <Mail size={20} className="text-foreground" />,
    largeIcon: <Mail size={32} className="text-foreground" />,
    bg: 'bg-muted/50',
    actionLabel: 'Email',
    actionClassName: 'rounded-full',
  },
  website: {
    icon: <Globe size={20} className="text-foreground" />,
    largeIcon: <Globe size={32} className="text-foreground" />,
    bg: 'bg-muted/50',
    actionLabel: 'Open',
    actionClassName: 'rounded-full',
  },
};

function getPlatformKey(url: string) {
  try {
    if (url.startsWith('mailto:')) {
      return 'email';
    }

    const hostname = new URL(url).hostname;
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    }
    if (hostname.includes('linkedin.com')) {
      return 'linkedin';
    }
    if (hostname.includes('threads.net')) {
      return 'threads';
    }
    if (hostname.includes('github.com')) {
      return 'github';
    }
    if (hostname.includes('instagram.com')) {
      return 'instagram';
    }
    if (hostname.includes('twitch.tv')) {
      return 'twitch';
    }
    if (hostname.includes('t.me') || hostname.includes('telegram.com')) {
      return 'telegram';
    }
    if (hostname.includes('discord.com')) {
      return 'discord';
    }
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    }
    return 'website';
  } catch {
    return null;
  }
}

function getLinkTitle(url: string, label?: string, previewTitle?: string) {
  if (label) {
    return label;
  }

  if (previewTitle) {
    return previewTitle;
  }

  if (url.startsWith('mailto:')) {
    return url.replace('mailto:', '');
  }

  try {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname.split('/').filter(Boolean);
    const handle = pathname.at(-1);
    return handle ? (handle.startsWith('@') ? handle : `@${handle}`) : url;
  } catch {
    return url;
  }
}

function getLinkDescription(url: string, description?: string, previewDescription?: string) {
  if (description) {
    return description;
  }

  if (previewDescription) {
    return previewDescription;
  }

  if (url.startsWith('mailto:')) {
    return 'Send me an email';
  }

  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getDisplayHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return null;
  }
}

function FaviconIcon({
  href,
  large,
}: {
  href: string;
  large?: boolean;
}) {
  const favicon = getFaviconUrl(href);
  const size = large ? 36 : 24;

  if (!favicon) {
    return <Globe size={large ? 32 : 20} className="text-foreground" />;
  }

  return (
    <Image
      src={favicon}
      alt=""
      width={size}
      height={size}
      className={cn(
        'object-contain',
        large ? 'h-9 w-9 rounded-xl' : 'h-6 w-6 rounded-md'
      )}
    />
  );
}

function PlatformIcon({
  href,
  large,
}: {
  href: string;
  large?: boolean;
}) {
  const key = getPlatformKey(href);
  const platform = key ? PLATFORM_MAP[key] : undefined;
  if (key === 'website') {
    return <FaviconIcon href={href} large={large} />;
  }

  if (!platform) {
    return <FaviconIcon href={href} large={large} />;
  }

  return large ? platform.largeIcon : platform.icon;
}

function LinkCard({
  card,
  preview,
}: {
  card: SiteLinkCard;
  preview?: LinkPreview | null;
}) {
  const key = getPlatformKey(card.href);
  const platform = key ? PLATFORM_MAP[key] : null;
  const title = getLinkTitle(card.href, card.label, preview?.title);
  const description = getLinkDescription(
    card.href,
    card.description,
    preview?.description
  );
  const mdSize = card.size.md;
  const isWebsite = key === 'website';
  const hostname = getDisplayHostname(card.href);

  if (card.variant === 'spotlight') {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
        onClick={() => trackCardClick(card.id, card.href)}
      >
        <CardShell className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(15,118,110,0.12),_transparent_42%)]" />
          <div className="relative flex h-full flex-col justify-center gap-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/90 shadow-sm">
                <PlatformIcon href={card.href} />
              </div>
              <div className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] text-primary">
                Current project
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-cal text-sm leading-tight">{title}</p>
              <p className="truncate text-muted-foreground text-xs">{hostname}</p>
              <p className="line-clamp-3 text-muted-foreground text-xs">
                {description}
              </p>
            </div>
          </div>
        </CardShell>
      </a>
    );
  }

  if (mdSize === '4x1') {
    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
        onClick={() => trackCardClick(card.id, card.href)}
      >
        <CardShell className="flex items-center gap-3 px-5">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/50">
            <PlatformIcon href={card.href} />
          </div>
          <span className="truncate font-cal text-sm">{title}</span>
          <div className="ml-auto shrink-0">
            <Button
              size="sm"
              variant="outline"
              className={platform?.actionClassName ?? 'rounded-full'}
            >
              {platform?.actionLabel ?? 'Open'}
            </Button>
          </div>
        </CardShell>
      </a>
    );
  }

  if (mdSize === '4x2') {
    const image = preview?.image;
    if ((!platform || isWebsite) && image) {
      return (
        <a
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full w-full"
          onClick={() => trackCardClick(card.id, card.href)}
        >
          <CardShell className="flex overflow-hidden">
            <div className="flex flex-1 flex-col justify-between p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
                <PlatformIcon href={card.href} />
              </div>
              <div className="space-y-1">
                <p className="font-cal text-base">{title}</p>
                <p className="line-clamp-2 text-muted-foreground text-xs">
                  {description}
                </p>
              </div>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                >
                  {platform?.actionLabel ?? 'Visit'}
                </Button>
              </div>
            </div>
            <div className="relative w-2/5 shrink-0">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
          </CardShell>
        </a>
      );
    }

    return (
      <a
        href={card.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
        onClick={() => trackCardClick(card.id, card.href)}
      >
        <CardShell className="flex overflow-hidden">
          <div className={cn('flex w-35 shrink-0 items-center justify-center', platform?.bg ?? 'bg-muted/50')}>
            <PlatformIcon href={card.href} large />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 p-5">
            <p className="font-cal text-base">{title}</p>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              {description}
            </p>
            <div>
              <Button
                size="sm"
                className={platform?.actionClassName ?? 'rounded-full'}
              >
                {platform?.actionLabel ?? 'Open'}
              </Button>
            </div>
          </div>
        </CardShell>
      </a>
    );
  }

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full"
      onClick={() => trackCardClick(card.id, card.href)}
    >
      <CardShell className="flex flex-col p-5">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
          <PlatformIcon href={card.href} />
        </div>
        <div className="mt-auto space-y-1">
          <p className="font-cal text-sm leading-tight">{title}</p>
          <p className="truncate text-muted-foreground text-xs">{description}</p>
          <div className="pt-1">
            <Button
              size="sm"
              className={platform?.actionClassName ?? 'rounded-full'}
            >
              {platform?.actionLabel ?? 'Open'}
            </Button>
          </div>
        </div>
      </CardShell>
    </a>
  );
}

function NoteCard({ card }: { card: Extract<SiteCard, { type: 'note' }> }) {
  return (
    <CardShell className="flex h-full w-full flex-col p-5">
      <div
        className={cn(
          'prose prose-sm h-full w-full max-w-none overflow-hidden dark:prose-invert prose-headings:font-cal prose-headings:text-sm prose-p:m-0 prose-p:text-xs prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5'
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local config content
        dangerouslySetInnerHTML={{ __html: card.html }}
      />
    </CardShell>
  );
}

function ImageCard({ card }: { card: SiteImageCard }) {
  const content = (
    <CardShell>
      <div className="relative h-full min-h-40 w-full">
        <Image
          src={card.url}
          alt={card.caption ?? 'Image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {card.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/20 to-transparent p-3">
            <p className="font-medium text-sm text-white">{card.caption}</p>
          </div>
        )}
      </div>
    </CardShell>
  );

  if (!card.href) {
    return content;
  }

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full"
      onClick={() => trackCardClick(card.id, card.href ?? card.url)}
    >
      {content}
    </a>
  );
}

function getTiles(lat: number, lng: number) {
  const zoom = 15;
  const xFloat = ((lng + 180) / 360) * 2 ** zoom;
  const latRad = (lat * Math.PI) / 180;
  const yFloat =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    2 ** zoom;
  const cx = Math.floor(xFloat);
  const cy = Math.floor(yFloat);
  const tiles: { url: string; dx: number; dy: number }[] = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({
        url: `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${cx + dx}/${cy + dy}@2x.png`,
        dx,
        dy,
      });
    }
  }

  return {
    tiles,
    offsetX: (xFloat - cx) * 256,
    offsetY: (yFloat - cy) * 256,
  };
}

function useReverseGeocode(lat: number, lng: number) {
  const [placeName, setPlaceName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`
    )
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !data.address) {
          return;
        }

        const address = data.address;
        const parts = [
          address.suburb ||
            address.neighbourhood ||
            address.village ||
            address.town ||
            address.city_district,
          address.city || address.state,
          address.country,
        ].filter(Boolean);
        setPlaceName(parts.join(', '));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return placeName;
}

function MapCard({
  card,
  profileName,
  profileAvatar,
}: {
  card: SiteMapCard;
  profileName: string;
  profileAvatar?: string;
}) {
  const { tiles, offsetX, offsetY } = getTiles(card.latitude, card.longitude);
  const geocodedName = useReverseGeocode(card.latitude, card.longitude);
  const label = card.label || geocodedName;

  return (
    <CardShell className="relative overflow-hidden bg-[#111827]">
      <div
        className="absolute"
        style={{
          width: 256 * 3,
          height: 256 * 3,
          left: `calc(50% - ${offsetX + 256}px)`,
          top: `calc(50% - ${offsetY + 256}px)`,
        }}
      >
        {tiles.map((tile) => (
          <Image
            key={`${tile.dx}-${tile.dy}`}
            src={tile.url}
            alt=""
            width={256}
            height={256}
            className="absolute"
            style={{
              left: (tile.dx + 1) * 256,
              top: (tile.dy + 1) * 256,
            }}
            unoptimized
            draggable={false}
          />
        ))}
      </div>

      <div className="-translate-x-1/2 -translate-y-full absolute top-1/2 left-1/2 z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-primary shadow-[0_0_20px_rgba(15,118,110,0.45)]">
            {profileAvatar ? (
              <Image
                src={profileAvatar}
                alt={profileName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-cal text-sm text-white">
                {profileName[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div
            className="-mt-px h-0 w-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '8px solid white',
            }}
          />
        </div>
      </div>

      {label && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/80 via-black/30 to-transparent px-4 pt-8 pb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="truncate font-medium text-sm text-white">{label}</p>
          </div>
        </div>
      )}
    </CardShell>
  );
}

function useGitHubStats(username: string) {
  const [stats, setStats] = useState<GitHubStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch(`https://api.github.com/users/${username}`).then((response) =>
        response.json()
      ),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`
      ).then((response) => response.json()),
    ])
      .then(([user, repos]) => {
        if (cancelled) {
          return;
        }

        const totalStars = Array.isArray(repos)
          ? repos.reduce(
              (sum: number, repo: { stargazers_count?: number }) =>
                sum + (repo.stargazers_count ?? 0),
              0
            )
          : 0;

        setStats({
          avatar: user.avatar_url ?? '',
          name: user.name ?? username,
          bio: user.bio ?? '',
          publicRepos: user.public_repos ?? 0,
          followers: user.followers ?? 0,
          stars: totalStars,
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [username]);

  return stats;
}

function GitHubCard({ card }: { card: SiteGitHubCard }) {
  const stats = useGitHubStats(card.username);
  const mdSize = card.size.md;

  const body =
    mdSize === '4x4' ? (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl p-5">
        <div className="flex items-center gap-4">
          {stats?.avatar ? (
            <Image
              src={stats.avatar}
              alt={card.username}
              width={56}
              height={56}
              className="rounded-full border-2 border-border/60"
            />
          ) : (
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-border/60 bg-muted/50">
              <FaGithub size={26} className="text-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-cal text-lg leading-tight">
              {stats?.name ?? card.username}
            </p>
            <p className="text-muted-foreground text-sm">@{card.username}</p>
            {stats?.bio && (
              <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                {stats.bio}
              </p>
            )}
          </div>
        </div>
        {stats && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Repos', stats.publicRepos],
              ['Followers', stats.followers],
              ['Stars', stats.stars],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-xl border border-border/40 bg-muted/20 py-3"
              >
                <span className="font-cal text-lg">
                  {Number(value).toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-auto overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-2">
          <Image
            src={`https://ghchart.rshah.org/${card.username}`}
            alt={`${card.username} contributions`}
            width={720}
            height={100}
            className="w-full"
            unoptimized
          />
        </div>
      </div>
    ) : mdSize === '4x2' ? (
      <div className="flex h-full w-full items-stretch overflow-hidden rounded-2xl">
        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="flex items-center gap-3">
            {stats?.avatar ? (
              <Image
                src={stats.avatar}
                alt={card.username}
                width={40}
                height={40}
                className="rounded-full border border-border/60"
              />
            ) : (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted/50">
                <FaGithub size={18} className="text-foreground" />
              </div>
            )}
            <div>
              <p className="font-cal text-sm leading-tight">
                {stats?.name ?? card.username}
              </p>
              <p className="text-muted-foreground text-xs">@{card.username}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-2">
            <Image
              src={`https://ghchart.rshah.org/${card.username}`}
              alt={`${card.username} contributions`}
              width={720}
              height={100}
              className="w-full"
              unoptimized
            />
          </div>
        </div>
      </div>
    ) : (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
        {stats?.avatar ? (
          <Image
            src={stats.avatar}
            alt={card.username}
            width={48}
            height={48}
            className="rounded-full border-2 border-border/60"
          />
        ) : (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-border/60 bg-muted/50">
            <FaGithub size={22} className="text-foreground" />
          </div>
        )}
        <div className="space-y-0.5">
          <p className="font-cal text-sm leading-tight">
            {stats?.name ?? card.username}
          </p>
          <p className="text-muted-foreground text-xs">@{card.username}</p>
        </div>
        {stats && (
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="font-cal">{stats.followers}</span>
              <span className="ml-1 text-muted-foreground">followers</span>
            </div>
            <div>
              <span className="font-cal">{stats.publicRepos}</span>
              <span className="ml-1 text-muted-foreground">repos</span>
            </div>
          </div>
        )}
      </div>
    );

  return (
    <button
      type="button"
      className="block h-full w-full text-left"
      onClick={() => {
        trackCardClick(card.id, `https://github.com/${card.username}`);
        window.open(`https://github.com/${card.username}`, '_blank', 'noopener,noreferrer');
      }}
    >
      <CardShell>{body}</CardShell>
    </button>
  );
}

function SubscribeCard({ card }: { card: SiteEmailCollectCard }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const compact = card.size.md === '2x2';

  const heading = card.heading ?? 'Stay in touch';
  const description =
    card.description ?? 'Get notified when I post something new.';
  const buttonText = card.buttonText ?? 'Subscribe';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? 'Could not subscribe right now.');
      return;
    }

    setSubmitted(true);
    setEmail('');
  }

  if (submitted) {
    return (
      <CardShell className="flex h-full w-full flex-col items-center justify-center gap-2 p-5 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <p className="font-cal text-sm">You&apos;re subscribed</p>
        <p className="text-muted-foreground text-xs">
          Thanks for signing up.
        </p>
      </CardShell>
    );
  }

  return (
    <CardShell className={compact ? 'flex flex-col p-5' : 'flex flex-col justify-center gap-3 p-6'}>
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
        <Mail className="h-5 w-5 text-foreground" />
      </div>
      <div className={compact ? 'mt-auto space-y-2' : 'space-y-1'}>
        <p className="font-cal text-sm leading-tight">{heading}</p>
        {!compact && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={compact ? 'h-8 rounded-lg text-xs' : 'rounded-xl'}
          required
        />
        <Button
          type="submit"
          className={compact ? 'h-8 rounded-lg px-3 text-xs' : 'rounded-xl'}
          disabled={loading}
        >
          {loading ? '...' : buttonText}
        </Button>
      </form>
      {error && <p className="text-destructive text-xs">{error}</p>}
      {compact && (
        <p className="text-muted-foreground text-[11px]">{description}</p>
      )}
    </CardShell>
  );
}

function getNextOccurrence(targetDate: string, repeat: string) {
  const target = new Date(targetDate);
  const now = new Date();

  if (repeat === 'yearly') {
    while (target <= now) {
      target.setFullYear(target.getFullYear() + 1);
    }
  } else if (repeat === 'monthly') {
    while (target <= now) {
      target.setMonth(target.getMonth() + 1);
    }
  } else if (repeat === 'weekly') {
    while (target <= now) {
      target.setDate(target.getDate() + 7);
    }
  }

  return target;
}

function getTimeLeft(targetDate: string, repeat = 'none') {
  const effectiveTarget =
    repeat !== 'none'
      ? getNextOccurrence(targetDate, repeat)
      : new Date(targetDate);
  const diff = effectiveTarget.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

function useCountdown(targetDate: string, repeat = 'none') {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate, repeat));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate, repeat));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, repeat]);

  return timeLeft;
}

function CountdownCard({ card }: { card: SiteCountdownCard }) {
  const timeLeft = useCountdown(card.targetDate, card.repeat);
  const mdSize = card.size.md;

  if (mdSize === '4x4') {
    return (
      <CardShell className="flex h-full w-full flex-col items-center justify-center gap-5 p-6 text-center">
        {card.emoji && <span className="text-4xl">{card.emoji}</span>}
        {card.title && <p className="font-cal text-lg">{card.title}</p>}
        {timeLeft.isPast ? (
          <p className="font-cal text-2xl text-primary">Time&apos;s up!</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {[
              ['Days', timeLeft.days],
              ['Hours', timeLeft.hours],
              ['Minutes', timeLeft.minutes],
              ['Seconds', timeLeft.seconds],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-xl border border-border/40 bg-muted/20 px-3 py-4"
              >
                <span className="font-cal text-2xl tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardShell>
    );
  }

  if (mdSize === '4x2') {
    return (
      <CardShell className="flex h-full w-full flex-col justify-center gap-4 p-6">
        <div className="flex items-center gap-2">
          {card.emoji && <span className="text-xl">{card.emoji}</span>}
          {card.title && <p className="font-cal text-sm">{card.title}</p>}
        </div>
        {timeLeft.isPast ? (
          <p className="font-cal text-lg text-primary">Time&apos;s up!</p>
        ) : (
          <div className="flex items-center gap-4">
            {[
              ['days', timeLeft.days],
              ['hrs', timeLeft.hours],
              ['min', timeLeft.minutes],
              ['sec', timeLeft.seconds],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col items-center">
                <span className="font-cal text-3xl tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardShell>
    );
  }

  return (
    <CardShell className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
      {card.emoji && <span className="text-2xl">{card.emoji}</span>}
      {card.title && <p className="font-cal text-xs leading-tight">{card.title}</p>}
      {timeLeft.isPast ? (
        <p className="font-cal text-primary text-sm">Time&apos;s up!</p>
      ) : (
        <div className="flex items-center gap-3">
          {[
            ['h', timeLeft.hours],
            ['m', timeLeft.minutes],
            ['s', timeLeft.seconds],
          ].map(([label, value], index) => (
            <div key={label} className="flex items-center gap-3">
              {index > 0 && (
                <span className="font-cal text-xl text-muted-foreground">:</span>
              )}
              <div className="flex flex-col items-center">
                <span className="font-cal text-2xl tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

const WEATHER_EMOJI: Record<string, string> = {
  '0': '☀️',
  '1': '🌤️',
  '2': '⛅',
  '3': '☁️',
  '45': '🌫️',
  '48': '🌫️',
  '51': '🌧️',
  '53': '🌧️',
  '55': '🌧️',
  '61': '🌧️',
  '63': '🌧️',
  '65': '🌧️',
  '71': '🌨️',
  '73': '🌨️',
  '75': '🌨️',
  '80': '🌦️',
  '81': '🌦️',
  '82': '🌦️',
  '95': '⛈️',
  '96': '⛈️',
  '99': '⛈️',
};

const WEATHER_DESC: Record<string, string> = {
  '0': 'Clear sky',
  '1': 'Mostly clear',
  '2': 'Partly cloudy',
  '3': 'Overcast',
  '45': 'Foggy',
  '48': 'Rime fog',
  '51': 'Light drizzle',
  '53': 'Drizzle',
  '55': 'Heavy drizzle',
  '61': 'Light rain',
  '63': 'Rain',
  '65': 'Heavy rain',
  '71': 'Light snow',
  '73': 'Snow',
  '75': 'Heavy snow',
  '80': 'Light showers',
  '81': 'Showers',
  '82': 'Heavy showers',
  '95': 'Thunderstorm',
  '96': 'Thunderstorm with hail',
  '99': 'Severe thunderstorm',
};

function useWeatherData(lat: number, lng: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
    )
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !data.current) {
          return;
        }
        const code = String(data.current.weather_code);
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          description: WEATHER_DESC[code] ?? 'Unknown',
          icon: WEATHER_EMOJI[code] ?? '🌡️',
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return weather;
}

function WeatherCard({ card }: { card: SiteWeatherCard }) {
  const weather = useWeatherData(card.latitude, card.longitude);
  const name = useReverseGeocode(card.latitude, card.longitude);
  const locationName = card.locationName || name;

  if (!weather) {
    return (
      <CardShell className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading weather…</p>
      </CardShell>
    );
  }

  if (card.size.md === '4x2') {
    return (
      <CardShell className="flex h-full w-full items-center gap-6 p-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{weather.icon}</span>
          <div>
            <span className="font-cal text-4xl">{weather.temp}°C</span>
            <p className="text-muted-foreground text-xs">
              Feels like {weather.feelsLike}°
            </p>
          </div>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="space-y-1">
          <p className="font-cal text-sm">{weather.description}</p>
          {locationName && (
            <p className="text-muted-foreground text-xs">{locationName}</p>
          )}
          <div className="flex gap-3 text-muted-foreground text-xs">
            <span>💧 {weather.humidity}%</span>
            <span>💨 {weather.windSpeed} km/h</span>
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell className="flex h-full w-full flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <span className="text-3xl">{weather.icon}</span>
        <span className="font-cal text-3xl">{weather.temp}°</span>
      </div>
      <div className="space-y-0.5">
        <p className="font-cal text-sm leading-tight">{weather.description}</p>
        {locationName && (
          <p className="truncate text-muted-foreground text-xs">
            {locationName}
          </p>
        )}
      </div>
    </CardShell>
  );
}

function useTweet(tweetId: string) {
  const [tweet, setTweet] = useState<TweetData | null>(null);

  useEffect(() => {
    if (!tweetId) {
      return;
    }

    let cancelled = false;
    const token = ((Number(tweetId) / 1e15) * Math.PI)
      .toString(36)
      .replace(/(0+|\.)/g, '');

    void fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en&token=${token}`
    )
      .then((response) => response.json())
      .then((raw) => {
        if (cancelled || !raw || raw.__typename === 'TweetTombstone' || !raw.user) {
          return;
        }

        setTweet({
          text: raw.text ?? '',
          createdAt: raw.created_at ?? '',
          user: {
            name: raw.user.name ?? '',
            screenName: raw.user.screen_name ?? '',
            profileImageUrl: raw.user.profile_image_url_https ?? '',
          },
          favoriteCount: raw.favorite_count ?? 0,
          retweetCount: raw.retweet_count ?? 0,
          replyCount: raw.conversation_count ?? raw.reply_count ?? 0,
          photos: (raw.mediaDetails ?? [])
            .filter((media: { type: string }) => media.type === 'photo')
            .map(
              (media: {
                media_url_https: string;
                original_info: { width: number; height: number };
              }) => ({
                url: media.media_url_https,
                width: media.original_info?.width ?? 0,
                height: media.original_info?.height ?? 0,
              })
            ),
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [tweetId]);

  return tweet;
}

function TwitterCard({ card }: { card: SiteTwitterCard }) {
  const tweet = useTweet(card.tweetId);
  const mdSize = card.size.md;

  if (!tweet) {
    return (
      <CardShell className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-muted/30">
        <FaXTwitter className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground text-xs">Loading tweet…</p>
      </CardShell>
    );
  }

  const content =
    mdSize === '4x4' ? (
      <div className="flex h-full w-full flex-col p-5">
        <div className="flex items-center gap-3">
          <Image
            src={tweet.user.profileImageUrl}
            alt={tweet.user.name}
            width={40}
            height={40}
            className="rounded-full"
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-cal text-sm leading-tight">
              {tweet.user.name}
            </p>
            <p className="truncate text-muted-foreground text-xs">
              @{tweet.user.screenName}
            </p>
          </div>
          <FaXTwitter size={16} className="shrink-0 text-muted-foreground" />
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed">{tweet.text}</p>
        {tweet.photos[0] && (
          <div className="mt-3 overflow-hidden rounded-xl">
            <Image
              src={tweet.photos[0].url}
              alt="Tweet media"
              width={tweet.photos[0].width}
              height={tweet.photos[0].height}
              className="h-auto w-full object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1">
              <MessageCircle size={13} />
              {formatCount(tweet.replyCount)}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 size={13} />
              {formatCount(tweet.retweetCount)}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={13} />
              {formatCount(tweet.favoriteCount)}
            </span>
          </div>
          <span>{formatTweetDate(tweet.createdAt)}</span>
        </div>
      </div>
    ) : mdSize === '4x2' ? (
      <div className="flex h-full w-full flex-col justify-between p-5">
        <div className="flex items-center gap-2.5">
          <Image
            src={tweet.user.profileImageUrl}
            alt={tweet.user.name}
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-cal text-sm leading-tight">
              {tweet.user.name}
            </p>
            <p className="truncate text-muted-foreground text-xs">
              @{tweet.user.screenName} · {formatTweetDate(tweet.createdAt)}
            </p>
          </div>
          <FaXTwitter size={14} className="shrink-0 text-muted-foreground" />
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed">{tweet.text}</p>
        <div className="flex items-center gap-5 text-muted-foreground text-xs">
          <span className="flex items-center gap-1">
            <MessageCircle size={12} />
            {formatCount(tweet.replyCount)}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 size={12} />
            {formatCount(tweet.retweetCount)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={12} />
            {formatCount(tweet.favoriteCount)}
          </span>
        </div>
      </div>
    ) : (
      <div className="flex h-full w-full flex-col justify-between p-5">
        <div className="flex items-center gap-2.5">
          <Image
            src={tweet.user.profileImageUrl}
            alt={tweet.user.name}
            width={28}
            height={28}
            className="rounded-full"
            unoptimized
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-cal text-xs leading-tight">
              {tweet.user.name}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              @{tweet.user.screenName}
            </p>
          </div>
          <FaXTwitter size={12} className="shrink-0 text-muted-foreground" />
        </div>
        <p className="line-clamp-4 text-xs leading-relaxed">{tweet.text}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatTweetDate(tweet.createdAt)}
        </p>
      </div>
    );

  return (
    <button
      type="button"
      className="block h-full w-full text-left"
      onClick={() => {
        const href = `https://x.com/i/status/${card.tweetId}`;
        trackCardClick(card.id, href);
        window.open(href, '_blank', 'noopener,noreferrer');
      }}
    >
      <CardShell>{content}</CardShell>
    </button>
  );
}

function useMusicMetadata(url: string, initialMetadata?: MusicMetadata | null) {
  const [metadata, setMetadata] = useState<MusicMetadata | null>(
    initialMetadata ?? null
  );
  const [loading, setLoading] = useState(!initialMetadata);

  useEffect(() => {
    if (initialMetadata) {
      setMetadata(initialMetadata);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const response = await fetch(
          `/api/music-metadata?url=${encodeURIComponent(url)}`
        );

        if (!response.ok) {
          throw new Error('Music metadata failed');
        }

        const data = (await response.json()) as MusicMetadata;

        if (!cancelled) {
          setMetadata(data);
        }
      } catch {
        if (!cancelled) {
          setMetadata(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [url, initialMetadata]);

  return { metadata, loading };
}

function MusicProviderIcon({ provider }: { provider: 'spotify' | 'apple' }) {
  if (provider === 'spotify') {
    return <Spotify className="h-5 w-5" />;
  }
  return <AppleMusic className="h-5 w-5 rounded" />;
}

function MusicCard({
  card,
  metadata: initialMetadata,
}: {
  card: SiteMusicCard;
  metadata?: MusicMetadata | null;
}) {
  const { metadata, loading } = useMusicMetadata(card.url, initialMetadata);
  const compact = card.size.md === '2x2';

  if (loading) {
    return (
      <CardShell className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading music…</p>
      </CardShell>
    );
  }

  if (!metadata) {
    return (
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
        onClick={() => trackCardClick(card.id, card.url)}
      >
        <CardShell className="flex h-full w-full flex-col p-5">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
            <Music className="h-5 w-5 text-foreground" />
          </div>
          <div className="mt-auto">
            <p className="font-cal text-sm leading-tight">Listen</p>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
              Open <ExternalLink className="h-3 w-3" />
            </p>
          </div>
        </CardShell>
      </a>
    );
  }

  const content = compact ? (
    <div className="relative flex h-full w-full overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <Image
          src={metadata.artwork}
          alt=""
          fill
          className="object-cover blur-2xl brightness-50 saturate-150"
          sizes="200px"
        />
      </div>
      <div className="relative flex h-full w-full items-center gap-3 p-4">
        <Image
          src={metadata.artwork}
          alt={metadata.title}
          width={80}
          height={80}
          className="h-20 w-20 shrink-0 rounded-lg object-cover shadow-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-cal text-sm text-white">
            {metadata.title}
          </p>
          {metadata.artist && (
            <p className="mt-0.5 truncate text-xs text-white/70">
              {metadata.artist}
            </p>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            <MusicProviderIcon provider={metadata.provider} />
            <span className="text-xs text-white/50">
              {metadata.provider === 'spotify' ? 'Spotify' : 'Apple Music'}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="relative flex h-full w-full overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <Image
          src={metadata.artwork}
          alt=""
          fill
          className="object-cover blur-3xl brightness-[0.35] saturate-150"
          sizes="500px"
        />
      </div>
      <div className="relative flex h-full w-full items-center gap-5 p-5">
        <Image
          src={metadata.artwork}
          alt={metadata.title}
          width={140}
          height={140}
          className="h-full max-h-36 w-auto shrink-0 rounded-xl object-cover shadow-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-cal text-lg text-white">
            {metadata.title}
          </p>
          {metadata.artist && (
            <p className="mt-1 truncate text-sm text-white/70">
              {metadata.artist}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <MusicProviderIcon provider={metadata.provider} />
            <span className="text-xs text-white/50">
              Listen on {metadata.provider === 'spotify' ? 'Spotify' : 'Apple Music'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full"
      onClick={() => trackCardClick(card.id, card.url)}
    >
      <CardShell>{content}</CardShell>
    </a>
  );
}

function PodcastsCard({ card }: { card: SitePodcastsCard }) {
  return (
    <CardShell className="flex h-full w-full flex-col p-3 md:p-4 md:pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 md:h-9 md:w-9">
          <PiApplePodcastsLogoFill className="h-4 w-4 text-[#872EC4] md:h-4.5 md:w-4.5" />
        </div>
        <div className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground md:px-2.5">
          {card.items.length} {card.items.length === 1 ? 'podcast' : 'podcasts'}
        </div>
      </div>

      <div className="mt-1 space-y-0.5 md:mt-1.5 md:space-y-1">
        <p className="font-cal text-[15px] leading-tight md:text-base">
          {card.title ?? 'Podcasts'}
        </p>
        {card.description && (
          <p className="text-[11px] text-muted-foreground md:text-xs">{card.description}</p>
        )}
      </div>

      {card.items.length > 0 ? (
        <PagedRows
          items={card.items}
          getKey={(item) => item.href ?? `${card.id}-${item.title}`}
          renderItem={(item) => {
            const row = (
              <div className="flex h-[58px] items-center gap-2 overflow-hidden rounded-xl border border-border/60 bg-background/70 px-2.5 py-1 transition-colors hover:bg-muted/30 md:h-16 md:gap-2.5 md:rounded-2xl md:px-3">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/50 md:h-10 md:w-10">
                  {item.artwork ? (
                    <Image
                      src={item.artwork}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <PiApplePodcastsLogoFill className="h-4 w-4 text-[#872EC4]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight md:text-sm">
                    {item.title}
                  </p>
                  {item.publisher && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground md:text-xs">
                      {item.publisher}
                    </p>
                  )}
                </div>
                {item.href && (
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground md:h-4 md:w-4" />
                )}
              </div>
            );

            if (!item.href) {
              return row;
            }

            return (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                onClick={() => trackCardClick(card.id, item.href!)}
              >
                {row}
              </a>
            );
          }}
        />
      ) : (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Add podcast channels in{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              src/content/site.ts
            </code>
          </p>
        </div>
      )}
    </CardShell>
  );
}

function YouTubeChannelsCard({
  card,
  metadataMap,
}: {
  card: SiteYouTubeChannelsCard;
  metadataMap?: Record<string, YouTubeChannelMetadata | null>;
}) {
  return (
    <CardShell className="flex h-full w-full flex-col p-3 md:p-4 md:pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 md:h-9 md:w-9">
          <FaYoutube className="h-4 w-4 text-[#FF0000] md:h-4.5 md:w-4.5" />
        </div>
        <div className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground md:px-2.5">
          {card.items.length} {card.items.length === 1 ? 'channel' : 'channels'}
        </div>
      </div>

      <div className="mt-1 space-y-0.5 md:mt-1.5 md:space-y-1">
        <p className="font-cal text-[15px] leading-tight md:text-base">
          {card.title ?? 'YouTube channels'}
        </p>
        {card.description && (
          <p className="text-[11px] text-muted-foreground md:text-xs">{card.description}</p>
        )}
      </div>

      <PagedRows
        items={card.items}
        getKey={(item) => item.href}
        renderItem={(item) => {
          const metadata = metadataMap?.[item.href];
          const title = item.title ?? metadata?.title ?? item.href;
          const artwork = item.artwork ?? metadata?.artwork;

          return (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => trackCardClick(card.id, item.href)}
            >
              <div className="flex h-[58px] items-center gap-2 overflow-hidden rounded-xl border border-border/60 bg-background/70 px-2.5 py-1 transition-colors hover:bg-muted/30 md:h-16 md:gap-2.5 md:rounded-2xl md:px-3">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted/50 md:h-10 md:w-10">
                  {artwork ? (
                    <Image
                      src={artwork}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FaYoutube className="h-4 w-4 text-[#FF0000]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight md:text-sm">{title}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground md:h-4 md:w-4" />
              </div>
            </a>
          );
        }}
      />
    </CardShell>
  );
}

function BooksCard({
  card,
  metadataMap,
}: {
  card: SiteBooksCard;
  metadataMap?: Record<string, BookMetadata | null>;
}) {
  return (
    <CardShell className="flex h-full w-full flex-col p-3 md:p-4 md:pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 md:h-9 md:w-9">
          <BookOpen className="h-4 w-4 text-[#8B5E34] md:h-4.5 md:w-4.5" />
        </div>
        <div className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground md:px-2.5">
          {card.items.length} {card.items.length === 1 ? 'book' : 'books'}
        </div>
      </div>

      <div className="mt-1 space-y-0.5 md:mt-1.5 md:space-y-1">
        <p className="font-cal text-[15px] leading-tight md:text-base">{card.title ?? 'Books'}</p>
        {card.description && (
          <p className="text-[11px] text-muted-foreground md:text-xs">{card.description}</p>
        )}
      </div>

      <PagedRows
        items={card.items}
        getKey={(item) => item.href}
        renderItem={(item) => {
          const metadata = metadataMap?.[item.href];
          const title = item.title ?? metadata?.title ?? item.href;
          const subtitle = item.subtitle ?? metadata?.subtitle;
          const artwork = item.artwork ?? metadata?.artwork;

          return (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => trackCardClick(card.id, item.href)}
            >
              <div className="flex h-[58px] items-center gap-2 overflow-hidden rounded-xl border border-border/60 bg-background/70 px-2.5 py-1 transition-colors hover:bg-muted/30 md:h-16 md:gap-2.5 md:rounded-2xl md:px-3">
                <div className="relative h-9 w-7 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/50 md:h-10 md:w-8">
                  {artwork ? (
                    <Image
                      src={artwork}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-4 w-4 text-[#8B5E34]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight md:text-sm">
                    {title}
                  </p>
                  {subtitle && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground md:text-xs">
                      {subtitle}
                    </p>
                  )}
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground md:h-4 md:w-4" />
              </div>
            </a>
          );
        }}
      />
    </CardShell>
  );
}

function FavoritesCard({ card }: { card: SiteFavoritesCard }) {
  return (
    <CardShell className="flex h-full w-full flex-col p-3 md:p-4 md:pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 md:h-9 md:w-9">
          <Heart className="h-4 w-4 text-red-500 md:h-4.5 md:w-4.5" />
        </div>
        <div className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground md:px-2.5">
          {card.items.length} {card.items.length === 1 ? 'pick' : 'picks'}
        </div>
      </div>

      <div className="mt-1 space-y-0.5 md:mt-1.5 md:space-y-1">
        <p className="font-cal text-[15px] leading-tight md:text-base">
          {card.title ?? 'Favorites'}
        </p>
        {card.description && (
          <p className="text-[11px] text-muted-foreground md:text-xs">{card.description}</p>
        )}
      </div>

      <PagedRows
        items={card.items}
        getKey={(item) => item.href}
        renderItem={(item) => {
          const favicon = getFaviconUrl(item.href);

          return (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => trackCardClick(card.id, item.href)}
            >
              <div className="flex h-[58px] items-center gap-2 overflow-hidden rounded-xl border border-border/60 bg-background/70 px-2.5 py-1 transition-colors hover:bg-muted/30 md:h-16 md:gap-2.5 md:rounded-2xl md:px-3">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/50 md:h-10 md:w-10">
                  {favicon ? (
                    <Image
                      src={favicon}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight md:text-sm">
                    {item.title}
                  </p>
                  {item.tagline && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground md:text-xs">
                      {item.tagline}
                    </p>
                  )}
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground md:h-4 md:w-4" />
              </div>
            </a>
          );
        }}
      />
    </CardShell>
  );
}

function getCalendarEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('cal.com')) {
      return `${url}?embed=true&theme=light`;
    }
    if (parsed.hostname.includes('calendly.com')) {
      return `${url}?embed_type=inline`;
    }
    return null;
  } catch {
    return null;
  }
}

function CalendarCard({ card }: { card: SiteCalendarCard }) {
  const [open, setOpen] = useState(false);
  const provider = useMemo(() => {
    try {
      const hostname = new URL(card.url).hostname;
      if (hostname.includes('cal.com')) {
        return 'Cal.com';
      }
      if (hostname.includes('calendly.com')) {
        return 'Calendly';
      }
      return 'Calendar';
    } catch {
      return 'Calendar';
    }
  }, [card.url]);
  const embedUrl = getCalendarEmbedUrl(card.url);

  return (
    <>
      <button
        type="button"
        className="block h-full w-full text-left"
        onClick={() => {
          trackCardClick(card.id, card.url);
          if (embedUrl) {
            setOpen(true);
          } else {
            window.open(card.url, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        <CardShell className={card.size.md === '2x2' ? 'flex h-full w-full flex-col p-5' : 'flex h-full w-full flex-col p-6'}>
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50">
            <Calendar className="h-5 w-5 text-foreground" />
          </div>
          <div className="mt-auto space-y-1">
            <p className="font-cal text-base leading-tight">
              {card.title || 'Book a time'}
            </p>
            <p className="text-muted-foreground text-xs">
              {card.description || 'Schedule a meeting with me'}
            </p>
            <div className="pt-2 text-xs text-muted-foreground">via {provider}</div>
          </div>
        </CardShell>
      </button>

      {embedUrl && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex h-[85vh] max-h-175 flex-col overflow-hidden sm:max-w-2xl">
            <DialogHeader className="shrink-0">
              <DialogTitle>{card.title || 'Book a time'}</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border">
              <iframe
                src={embedUrl}
                title={card.title || 'Calendar'}
                className="h-full w-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function ViewsCard({
  card,
  summary,
}: {
  card: SiteViewsCard;
  summary: SiteMetricsSummary;
}) {
  if (card.size.md === '4x1') {
    return (
      <CardShell className="flex h-full w-full items-center justify-center gap-3 px-6">
        <Eye size={18} className="shrink-0 text-muted-foreground" />
        <p className="font-cal text-xl leading-tight">
          {summary.totalViews.toLocaleString()}
        </p>
        <p className="text-muted-foreground text-sm">site views</p>
      </CardShell>
    );
  }

  return (
    <CardShell className="flex h-full w-full flex-col items-center justify-center gap-2 p-5">
      <Eye size={24} className="text-muted-foreground" />
      <div className="text-center">
        <p className="font-cal text-3xl leading-tight">
          {summary.totalViews.toLocaleString()}
        </p>
        <p className="mt-1 text-muted-foreground text-xs">site views</p>
      </div>
    </CardShell>
  );
}

export default function SiteCardView({
  card,
  summary,
  previews,
  musicMetadata,
  youtubeChannelMetadata,
  bookMetadata,
  profileName,
  profileAvatar,
}: {
  card: SiteCard;
  summary: SiteMetricsSummary;
  previews: LinkPreviewMap;
  musicMetadata?: MusicMetadata | null;
  youtubeChannelMetadata?: Record<string, YouTubeChannelMetadata | null>;
  bookMetadata?: Record<string, BookMetadata | null>;
  profileName: string;
  profileAvatar?: string;
}) {
  switch (card.type) {
    case 'link':
      return <LinkCard card={card} preview={previews[card.id]} />;
    case 'note':
      return <NoteCard card={card} />;
    case 'image':
      return <ImageCard card={card} />;
    case 'map':
      return (
        <MapCard
          card={card}
          profileName={profileName}
          profileAvatar={profileAvatar}
        />
      );
    case 'github':
      return <GitHubCard card={card} />;
    case 'email-collect':
      return <SubscribeCard card={card} />;
    case 'countdown':
      return <CountdownCard card={card} />;
    case 'weather':
      return <WeatherCard card={card} />;
    case 'twitter':
      return <TwitterCard card={card} />;
    case 'music':
      return <MusicCard card={card} metadata={musicMetadata} />;
    case 'podcasts':
      return <PodcastsCard card={card} />;
    case 'youtube-channels':
      return (
        <YouTubeChannelsCard
          card={card}
          metadataMap={youtubeChannelMetadata}
        />
      );
    case 'books':
      return <BooksCard card={card} metadataMap={bookMetadata} />;
    case 'favorites':
      return <FavoritesCard card={card} />;
    case 'calendar':
      return <CalendarCard card={card} />;
    case 'views':
      return <ViewsCard card={card} summary={summary} />;
  }
}
