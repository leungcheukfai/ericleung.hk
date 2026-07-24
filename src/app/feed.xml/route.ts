import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

const SITE_UPDATED_AT = '2026-07-24T00:00:00.000Z';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const revalidate = 3600;

export function GET() {
  const origin = getSiteOrigin();
  const feedUrl = `${origin}/feed.xml`;
  const updatedAt = new Date(SITE_UPDATED_AT).toUTCString();
  const title = escapeXml(siteConfig.title);
  const description = escapeXml(siteConfig.description);
  const homepageUrl = `${origin}/`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${homepageUrl}</link>
    <description>${description}</description>
    <language>en-HK</language>
    <lastBuildDate>${updatedAt}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <item>
      <title>${title} — profile and work</title>
      <link>${homepageUrl}</link>
      <guid isPermaLink="true">${homepageUrl}#profile</guid>
      <description>${description}</description>
      <pubDate>${updatedAt}</pubDate>
    </item>
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
