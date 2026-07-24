import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

export function GET() {
  const origin = getSiteOrigin();
  const body = `# ${siteConfig.title}

> ${siteConfig.description}

## Profile
- ${origin}/ — biography, projects, interests, social profiles, and ways to connect with Eric Leung.

## Feeds
- ${origin}/feed.xml — RSS feed for site updates.

## Topics
AI, emerging technology, smart home innovation, go-to-market strategy, Hong Kong, Buddhist wisdom, space, books, podcasts, and product building.

## Canonical source
${origin}/
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
