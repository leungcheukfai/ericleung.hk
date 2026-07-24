import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

export default function SiteStructuredData() {
  const origin = getSiteOrigin();
  const sameAs = siteConfig.cards.flatMap((card) =>
    card.type === 'link' && card.href.startsWith('http') ? [card.href] : []
  );

  const graph = [
    {
      '@type': 'Person',
      '@id': `${origin}/#person`,
      name: siteConfig.profile.name,
      alternateName: siteConfig.profile.handle,
      description: siteConfig.description,
      image: siteConfig.profile.avatar
        ? `${origin}${siteConfig.profile.avatar}`
        : undefined,
      jobTitle: siteConfig.profile.role,
      homeLocation: { '@type': 'Place', name: siteConfig.profile.location },
      url: origin,
      sameAs,
    },
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
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  );
}
