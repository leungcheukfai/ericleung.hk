import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

export function GET() {
  const origin = getSiteOrigin();
  return Response.json({
    name: siteConfig.title,
    description: 'A personal website and public profile for Eric Leung.',
    capabilities: [
      'Learn about Eric Leung',
      'Browse his projects and interests',
      'Find ways to connect',
      'Book a 30-minute meeting',
    ],
    contact: `${origin}/`,
  });
}
