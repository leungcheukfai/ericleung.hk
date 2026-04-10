import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import SiteGridShell from '@/components/site/grid-shell';
import SiteHeader from '@/components/site/header';
import SiteThemeWrapper from '@/components/site/theme-wrapper';
import SiteViewTracker from '@/components/site/view-tracker';
import { siteConfig } from '@/content/site';
import { getBookMetadataMap } from '@/server/book-metadata';
import { getLinkPreviews } from '@/server/link-previews';
import { getMusicMetadataMap } from '@/server/music-metadata';
import { getPublicSiteSummary } from '@/server/site-analytics';
import { getYouTubeChannelMetadataMap } from '@/server/youtube-channel-metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  ...defaultMetadata,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    ...ogMetadata,
  },
  twitter: {
    ...twitterMetadata,
  },
};

export const revalidate = 3600;

const EMPTY_SUMMARY = {
  totalViews: 0,
  uniqueVisitors: 0,
  totalClicks: 0,
  totalSubscribers: 0,
};

export default async function HomePage() {
  const needsSummary = siteConfig.cards.some((card) => card.type === 'views');
  const [
    summary,
    previews,
    musicMetadataMap,
    youtubeChannelMetadataMap,
    bookMetadataMap,
  ] =
    await Promise.all([
      needsSummary ? getPublicSiteSummary() : Promise.resolve(EMPTY_SUMMARY),
      getLinkPreviews(siteConfig.cards),
      getMusicMetadataMap(siteConfig.cards),
      getYouTubeChannelMetadataMap(siteConfig.cards),
      getBookMetadataMap(siteConfig.cards),
    ]);

  return (
    <SiteThemeWrapper
      themeName={siteConfig.theme.preset}
      darkMode={siteConfig.theme.darkMode}
      accentColor={siteConfig.theme.accentColor}
    >
      <SiteViewTracker />

      <main className="container mx-auto flex min-h-screen w-full flex-col items-center gap-y-6 px-4 pt-16 pb-16">
        <div className="h-full w-full max-w-3xl">
          <div className="flex flex-col gap-y-6">
            <div className="animate-fade-in">
              <SiteHeader />
            </div>

            <SiteGridShell
              cards={siteConfig.cards}
              summary={summary}
              previews={previews}
              musicMetadataMap={musicMetadataMap}
              youtubeChannelMetadataMap={youtubeChannelMetadataMap}
              bookMetadataMap={bookMetadataMap}
              profileName={siteConfig.profile.name}
              profileAvatar={siteConfig.profile.avatar}
            />

            <footer className="animate-fade-in py-8 text-center">
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-background/80 px-5 py-4 text-center text-muted-foreground text-sm backdrop-blur-sm">
                <p>{siteConfig.footer.notice}</p>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  <a
                    className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                    href={siteConfig.footer.sourceHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {siteConfig.footer.sourceLabel}
                  </a>
                  <a
                    className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                    href={siteConfig.footer.upstreamHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {siteConfig.footer.upstreamLabel}
                  </a>
                  <a
                    className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
                    href={siteConfig.footer.licenseHref}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {siteConfig.footer.licenseLabel}
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </SiteThemeWrapper>
  );
}
