import { listArticles } from '@/lib/rankowl';
import { getSiteOrigin } from '@/lib/site-url';
import type { MetadataRoute } from 'next';

const BASE_URL = getSiteOrigin();

export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listArticles();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: articles[0] ? new Date(articles[0].updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    ...articles.map((article) => ({
      url: `${BASE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
