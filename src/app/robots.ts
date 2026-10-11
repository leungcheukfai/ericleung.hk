import { getSiteOrigin } from '@/lib/site-url';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/blog/preview/'],
      },
      {
        userAgent: [
          'OAI-SearchBot',
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
        ],
        allow: '/',
        disallow: ['/admin/', '/api/', '/blog/preview/'],
      },
    ],
    sitemap: `${getSiteOrigin()}/sitemap.xml`,
  };
}
