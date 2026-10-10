import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import SiteBentoGrid from '@/components/site/bento-grid';
import SiteFooter from '@/components/site/footer';
import SiteHeader from '@/components/site/header';
import { SiteLocaleProvider } from '@/components/site/locale';
import SiteStructuredData from '@/components/site/structured-data';
import SiteThemeWrapper from '@/components/site/theme-wrapper';
import SiteViewTracker from '@/components/site/view-tracker';
import { siteConfig } from '@/content/site';
import {
  zhCards,
  zhDescription,
  zhFooterNotice,
  zhMetaTitle,
  zhProfile,
} from '@/content/site-zh';
import { getSiteOrigin } from '@/lib/site-url';
import { getBookMetadataMap } from '@/server/book-metadata';
import { getLinkPreviews } from '@/server/link-previews';
import { getMusicMetadataMap } from '@/server/music-metadata';
import { getPublicSiteSummary } from '@/server/site-analytics';
import { getSiteCards } from '@/server/site-content';
import { getYouTubeChannelMetadataMap } from '@/server/youtube-channel-metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  ...defaultMetadata,
  title: zhMetaTitle,
  description: zhDescription,
  alternates: {
    canonical: '/zh',
    languages: { en: '/', 'zh-Hant-HK': '/zh', 'x-default': '/' },
  },
  openGraph: {
    ...ogMetadata,
    title: zhMetaTitle,
    description: zhDescription,
    url: `${getSiteOrigin()}/zh`,
    locale: 'zh_HK',
  },
  twitter: {
    ...twitterMetadata,
    title: zhMetaTitle,
    description: zhDescription,
  },
};

export const revalidate = 3600;

const EMPTY_SUMMARY = {
  totalViews: 0,
  uniqueVisitors: 0,
  totalClicks: 0,
  totalSubscribers: 0,
};

/** The home page in Hong Kong written Chinese: same cards and links, Chinese wording. */
export default async function ZhHomePage() {
  const cards = zhCards(await getSiteCards());
  const needsSummary = cards.some((card) => card.type === 'views');
  const [
    summary,
    previews,
    musicMetadataMap,
    youtubeChannelMetadataMap,
    bookMetadataMap,
  ] = await Promise.all([
    needsSummary ? getPublicSiteSummary() : Promise.resolve(EMPTY_SUMMARY),
    getLinkPreviews(cards),
    getMusicMetadataMap(cards),
    getYouTubeChannelMetadataMap(cards),
    getBookMetadataMap(cards),
  ]);

  return (
    <SiteThemeWrapper
      themeName={siteConfig.theme.preset}
      darkMode={siteConfig.theme.darkMode}
      accentColor={siteConfig.theme.accentColor}
    >
      <SiteStructuredData />
      <SiteViewTracker />

      <SiteLocaleProvider locale="zh">
        <main
          lang="zh-Hant-HK"
          className="container mx-auto flex min-h-screen w-full flex-col items-center gap-y-5 px-4 pt-16 pb-16"
        >
          <div className="h-full w-full max-w-3xl">
            <div className="flex flex-col gap-y-5">
              <div className="animate-fade-in">
                <SiteHeader profile={zhProfile} />
              </div>

              <SiteBentoGrid
                cards={cards}
                summary={summary}
                previews={previews}
                musicMetadataMap={musicMetadataMap}
                youtubeChannelMetadataMap={youtubeChannelMetadataMap}
                bookMetadataMap={bookMetadataMap}
                profileName={zhProfile.name}
                profileAvatar={siteConfig.profile.avatar}
              />

              <SiteFooter notice={zhFooterNotice} />
            </div>
          </div>
        </main>
      </SiteLocaleProvider>
    </SiteThemeWrapper>
  );
}
