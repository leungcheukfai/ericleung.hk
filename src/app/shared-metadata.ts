import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

const TITLE = siteConfig.title;
const DESCRIPTION = siteConfig.description;
const SITE_URL = getSiteOrigin();

export const defaultMetadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
};

export const twitterMetadata = {
  title: TITLE,
  description: DESCRIPTION,
  card: 'summary_large_image',
  images: [`${SITE_URL}/api/og`],
};

export const ogMetadata = {
  title: TITLE,
  description: DESCRIPTION,
  type: 'website',
  url: SITE_URL,
  images: [`${SITE_URL}/api/og`],
};
