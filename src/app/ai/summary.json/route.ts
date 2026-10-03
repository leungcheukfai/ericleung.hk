import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

export function GET() {
  const origin = getSiteOrigin();
  return Response.json({
    name: siteConfig.profile.name,
    handle: siteConfig.profile.handle,
    description: siteConfig.description,
    role: siteConfig.profile.role,
    location: siteConfig.profile.location,
    url: origin,
    profileUrl: `${origin}/`,
    topics: siteConfig.profile.knowsAbout,
    projects: siteConfig.projects.map(({ name, url, description }) => ({
      name,
      url,
      description,
    })),
  });
}
