import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

export function GET() {
  const origin = getSiteOrigin();
  const projects = siteConfig.projects
    .map(
      (project) => `- [${project.name}](${project.url}): ${project.description}`
    )
    .join('\n');
  const profiles = siteConfig.cards
    .flatMap((card) => {
      if (card.type === 'github') {
        return [`https://github.com/${card.username}`];
      }
      return card.type === 'link' ? [card.href] : [];
    })
    .filter((href) => !siteConfig.projects.some((p) => href.startsWith(p.url)))
    .map((href) => `- ${href}`)
    .join('\n');

  const body = `# ${siteConfig.profile.name}

> ${siteConfig.description}

${siteConfig.profile.name} is based in ${siteConfig.profile.location}. This is his official personal website.

## Profile
- [Homepage](${origin}/): biography, projects, interests, social profiles, and ways to connect with ${siteConfig.profile.name}.

## Projects
${projects}

## Profiles and links
${profiles}

## Machine-readable
- [Summary](${origin}/ai/summary.json): name, role, location, and topics as JSON.
- [FAQ](${origin}/ai/faq.json): common questions about ${siteConfig.profile.name}.
- [RSS feed](${origin}/feed.xml): site updates.

## Topics
${siteConfig.profile.knowsAbout.join(', ')}, Hong Kong, Buddhist wisdom, space, books, and podcasts.

## Canonical source
${origin}/
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
