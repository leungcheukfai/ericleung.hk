import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

const SOCIAL_PROFILE_HOSTS = new Set([
  'instagram.com',
  'linkedin.com',
  'threads.net',
  'threads.com',
  'x.com',
  'twitter.com',
]);

const WWW_PREFIX_RE = /^www\./;

function isSocialProfile(href: string) {
  try {
    const hostname = new URL(href).hostname.replace(WWW_PREFIX_RE, '');
    return SOCIAL_PROFILE_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

export default function SiteStructuredData() {
  const origin = getSiteOrigin();
  const sameAs = siteConfig.cards.flatMap((card) => {
    if (card.type === 'github') {
      return [`https://github.com/${card.username}`];
    }
    return card.type === 'link' && isSocialProfile(card.href)
      ? [card.href]
      : [];
  });
  const projects = siteConfig.projects.map((project) => ({
    '@type': 'Organization',
    '@id': `${project.url}/#organization`,
    name: project.name,
    url: project.url,
    description: project.description,
    ...(project.role === 'founder'
      ? { founder: { '@id': `${origin}/#person` } }
      : {}),
  }));

  const graph = [
    {
      '@type': 'Person',
      '@id': `${origin}/#person`,
      name: siteConfig.profile.name,
      alternateName: [
        siteConfig.profile.chineseName,
        siteConfig.profile.handle,
      ].filter(Boolean),
      description: siteConfig.description,
      image: siteConfig.profile.avatar
        ? `${origin}${siteConfig.profile.avatar}`
        : undefined,
      jobTitle: siteConfig.profile.role,
      knowsAbout: siteConfig.profile.knowsAbout,
      homeLocation: { '@type': 'Place', name: siteConfig.profile.location },
      url: origin,
      sameAs,
    },
    ...projects,
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: siteConfig.title,
      url: origin,
      description: siteConfig.description,
      publisher: { '@id': `${origin}/#person` },
      inLanguage: 'en-HK',
    },
    {
      '@type': 'ProfilePage',
      '@id': `${origin}/#webpage`,
      url: origin,
      name: siteConfig.title,
      about: { '@id': `${origin}/#person` },
      isPartOf: { '@id': `${origin}/#website` },
      mainEntity: { '@id': `${origin}/#person` },
    },
  ];

  return (
    <script
      type="application/ld+json"
      // JSON-LD is generated from trusted local site configuration.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      }}
    />
  );
}
