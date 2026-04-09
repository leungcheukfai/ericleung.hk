import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import SiteBentoGrid from '@/components/site/bento-grid';
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

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    summary,
    previews,
    musicMetadataMap,
    youtubeChannelMetadataMap,
    bookMetadataMap,
  ] =
    await Promise.all([
      getPublicSiteSummary(),
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

            <SiteBentoGrid
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
              <div className="inline-flex items-center rounded-full border border-border bg-background/80 px-4 py-2 text-muted-foreground text-sm backdrop-blur-sm">
                {siteConfig.footer.text}
              </div>
            </footer>
          </div>
        </div>
      </main>
    </SiteThemeWrapper>
  );
}
