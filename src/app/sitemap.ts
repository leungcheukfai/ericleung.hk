import { getSiteOrigin } from '@/lib/site-url';
import type { MetadataRoute } from 'next';

const BASE_URL = getSiteOrigin();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
