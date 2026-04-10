import type { BentoSize } from '@/components/bento/sizes';

type SiteBreakpoint = 'sm' | 'md';

type SiteCardSize = Record<SiteBreakpoint, BentoSize>;

type SiteCardPosition = Partial<
  Record<
    SiteBreakpoint,
    {
      x: number;
      y: number;
    }
  >
>;

type SiteCardBase = {
  id: string;
  size: SiteCardSize;
  position?: SiteCardPosition;
};

export type SiteLinkCard = SiteCardBase & {
  type: 'link';
  href: string;
  label?: string;
  description?: string;
  variant?: 'default' | 'spotlight';
};

export type SiteNoteCard = SiteCardBase & {
  type: 'note';
  html: string;
};

export type SiteImageCard = SiteCardBase & {
  type: 'image';
  url: string;
  caption?: string;
  href?: string;
};

export type SiteMapCard = SiteCardBase & {
  type: 'map';
  latitude: number;
  longitude: number;
  label?: string;
};

export type SiteGitHubCard = SiteCardBase & {
  type: 'github';
  username: string;
};

export type SiteEmailCollectCard = SiteCardBase & {
  type: 'email-collect';
  heading?: string;
  description?: string;
  buttonText?: string;
};

export type SiteCountdownCard = SiteCardBase & {
  type: 'countdown';
  title?: string;
  targetDate: string;
  emoji?: string;
  repeat?: 'none' | 'yearly' | 'monthly' | 'weekly';
};

export type SiteWeatherCard = SiteCardBase & {
  type: 'weather';
  latitude: number;
  longitude: number;
  locationName?: string;
};

export type SiteTwitterCard = SiteCardBase & {
  type: 'twitter';
  tweetId: string;
};

export type SiteMusicCard = SiteCardBase & {
  type: 'music';
  url: string;
};

export type SitePodcastsCard = SiteCardBase & {
  type: 'podcasts';
  title?: string;
  description?: string;
  items: Array<{
    title: string;
    publisher?: string;
    href?: string;
    artwork?: string;
  }>;
};

export type SiteYouTubeChannelsCard = SiteCardBase & {
  type: 'youtube-channels';
  title?: string;
  description?: string;
  items: Array<{
    href: string;
    title?: string;
    artwork?: string;
  }>;
};

export type SiteBooksCard = SiteCardBase & {
  type: 'books';
  title?: string;
  description?: string;
  items: Array<{
    href: string;
    title?: string;
    subtitle?: string;
    artwork?: string;
  }>;
};

export type SiteFavoritesCard = SiteCardBase & {
  type: 'favorites';
  title?: string;
  description?: string;
  items: Array<{
    title: string;
    tagline?: string;
    href: string;
  }>;
};

export type SiteCalendarCard = SiteCardBase & {
  type: 'calendar';
  url: string;
  title?: string;
  description?: string;
};

export type SiteViewsCard = SiteCardBase & {
  type: 'views';
};

export type SiteCard =
  | SiteLinkCard
  | SiteNoteCard
  | SiteImageCard
  | SiteMapCard
  | SiteGitHubCard
  | SiteEmailCollectCard
  | SiteCountdownCard
  | SiteWeatherCard
  | SiteTwitterCard
  | SiteMusicCard
  | SitePodcastsCard
  | SiteYouTubeChannelsCard
  | SiteBooksCard
  | SiteFavoritesCard
  | SiteCalendarCard
  | SiteViewsCard;

type SiteConfig = {
  domain: string;
  title: string;
  description: string;
  keywords: string[];
  theme: {
    preset: string;
    darkMode: boolean;
    accentColor?: string;
  };
  profile: {
    name: string;
    handle?: string;
    role?: string;
    location?: string;
    avatar?: string;
    bioHtml: string;
    actions: Array<{
      label: string;
      href: string;
    }>;
  };
  footer: {
    notice: string;
    sourceHref: string;
    sourceLabel: string;
    upstreamHref: string;
    upstreamLabel: string;
    licenseHref: string;
    licenseLabel: string;
  };
  cards: SiteCard[];
};

export const siteConfig: SiteConfig = {
  domain: 'ericleung.hk',
  title: 'Eric Leung',
  description:
    'Personal website for Eric Leung. Replace this copy in src/content/site.ts with your own bio, links, and bento cards.',
  keywords: ['Eric Leung', 'ericleung.hk', 'portfolio', 'personal website'],
  theme: {
    preset: 'sunset',
    darkMode: false,
    accentColor: '#f97316',
  },
  profile: {
    name: 'Eric Leung',
    handle: '@ericleung.hk',
    role: 'Builder on the internet',
    location: 'Hong Kong',
    avatar: '/ericleung.webp',
    bioHtml:
      '<p>I’m passionate about exploring emerging technologies, especially AI and smart home innovations. I also find inspiration in Buddhist wisdom, and I aspire to one day travel to space.</p>',
    actions: [],
  },
  footer: {
    notice: 'Based on OpenBio, modified by Eric Leung and available under AGPL-3.0.',
    sourceHref: 'https://github.com/leungcheukfai/ericleung.hk',
    sourceLabel: 'Source code',
    upstreamHref: 'https://github.com/vanxh/openbio',
    upstreamLabel: 'Original project',
    licenseHref: 'https://github.com/leungcheukfai/ericleung.hk/blob/main/LICENSE',
    licenseLabel: 'AGPL-3.0 license',
  },
  cards: [
    {
      id: 'threads-link',
      type: 'link',
      size: { sm: '2x2', md: '2x2' },
      position: {
        md: { x: 0, y: 0 },
      },
      href: 'https://www.threads.net/@ericleung.hk',
      label: '@ericleung.hk',
      description: 'threads.net/@ericleung.hk',
    },
    {
      id: 'gtmguide-project',
      type: 'link',
      size: { sm: '2x2', md: '4x2' },
      position: {
        md: { x: 1, y: 0 },
      },
      href: 'https://gtmguide.hk',
      label: 'GTM Guide',
      description:
        'Practical go-to-market ideas, systems, and playbooks I am building right now.',
      variant: 'spotlight',
    },
    {
      id: 'hong-kong-map',
      type: 'map',
      size: { sm: '2x2', md: '2x2' },
      position: {
        md: { x: 3, y: 0 },
      },
      latitude: 22.3193,
      longitude: 114.1694,
      label: 'Hong Kong',
    },
    {
      id: 'github-profile',
      type: 'github',
      size: { sm: '4x2', md: '4x2' },
      username: 'leungcheukfai',
    },
    {
      id: 'book-a-time',
      type: 'calendar',
      size: { sm: '4x2', md: '4x2' },
      url: 'https://cal.com/ericleung/30min',
      title: 'Book a time',
      description: 'Schedule a 30-minute meeting with me',
    },
    {
      id: 'newsletter',
      type: 'email-collect',
      size: { sm: '4x2', md: '4x2' },
      heading: 'Stay in the loop',
      description:
        'Subscribe to the Unwire newsletter for new posts and useful ideas.',
      buttonText: 'Subscribe',
    },
    {
      id: 'apple-music',
      type: 'music',
      size: { sm: '4x2', md: '4x2' },
      url: 'https://music.apple.com/hk/album/cornfield-chase/1533983552?i=1533984393&l=en-GB',
    },
    {
      id: 'weekly-podcasts',
      type: 'podcasts',
      size: { sm: '4x4', md: '4x5' },
      title: 'Podcast channels',
      description: 'Shows I keep up with every week.',
      items: [
        {
          title: 'All-In with Chamath, Jason, Sacks & Friedberg',
          publisher: 'All-In Podcast, LLC',
          href: 'https://podcasts.apple.com/hk/podcast/all-in-with-chamath-jason-sacks-friedberg/id1502871393?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts124/v4/c7/d2/92/c7d292ea-44b3-47ff-2f5e-74fa5b23db6c/mza_7005270671777648882.png/600x600bb.jpg',
        },
        {
          title: 'The Koe Cast',
          publisher: 'Dan Koe',
          href: 'https://podcasts.apple.com/hk/podcast/the-koe-cast/id1566479559?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/71/57/e5/7157e504-cf5d-366f-4b59-d2f75e9a55f2/mza_4539399987799982527.jpg/600x600bb.jpg',
        },
        {
          title: 'The Game with Alex Hormozi',
          publisher: 'Alex Hormozi',
          href: 'https://podcasts.apple.com/hk/podcast/the-game-with-alex-hormozi/id1254720112?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/2f/54/0d/2f540d9c-bf31-4e40-02ca-67c4483634f5/mza_13803311963218242970.jpg/600x600bb.jpg',
        },
        {
          title: 'Christopher Lochhead Follow Your Different™',
          publisher: 'Christopher Lochhead',
          href: 'https://podcasts.apple.com/hk/podcast/christopher-lochhead-follow-your-different/id1204044507?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/45/6b/fc/456bfc2b-fc53-19fa-0a35-f3a667ef5053/mza_13874834741790798110.png/600x600bb.jpg',
        },
        {
          title: 'Naval',
          publisher: 'Naval',
          href: 'https://podcasts.apple.com/hk/podcast/naval/id1454097755?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts123/v4/eb/f4/dc/ebf4dc3a-0292-a846-b8a1-496ea5c8b435/mza_6617487660716274171.png/600x600bb.jpg',
        },
        {
          title: 'We Are ENCODED',
          publisher: 'Chris Walker',
          href: 'https://podcasts.apple.com/hk/podcast/we-are-encoded/id1807399990?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/f4/cd/fc/f4cdfc05-980e-320e-6a61-2eebcd588e34/mza_15149214444119689117.jpg/600x600bb.jpg',
        },
        {
          title: 'The Martell Method w/ Dan Martell',
          publisher: 'Dan Martell',
          href: 'https://podcasts.apple.com/hk/podcast/the-martell-method-w-dan-martell/id1170821745?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/c6/6f/dc/c66fdc1e-a1f0-d18b-fd86-2146664b5094/mza_12898821534268968335.jpg/600x600bb.jpg',
        },
        {
          title: 'Smart Friends',
          publisher: 'Eric Jorgenson',
          href: 'https://podcasts.apple.com/hk/podcast/smart-friends/id1549324835?l=en-GB',
          artwork:
            'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/d1/bb/c4/d1bbc450-352e-42dd-40a5-454d83cf5eb9/mza_10963602523752764825.jpg/600x600bb.jpg',
        },
      ],
    },
    {
      id: 'youtube-channels',
      type: 'youtube-channels',
      size: { sm: '4x4', md: '4x5' },
      title: 'YouTube channels',
      description: 'Channels I keep up with.',
      items: [
        {
          href: 'https://www.youtube.com/@KillTony',
        },
        {
          href: 'https://www.youtube.com/@PredictiveHistory',
        },
        {
          href: 'https://www.youtube.com/@ycombinator',
        },
        {
          href: 'https://www.youtube.com/@BryanJohnson',
        },
        {
          href: 'https://www.youtube.com/@TheDiaryOfACEO',
        },
        {
          href: 'https://www.youtube.com/@starterstory',
        },
        {
          href: 'https://www.youtube.com/@BrockMesarich',
        },
        {
          href: 'https://www.youtube.com/@growwithalex',
        },
      ],
    },
    {
      id: 'things-i-like',
      type: 'favorites',
      size: { sm: '4x4', md: '4x5' },
      title: 'Things I Like',
      description: 'Brands, tools, and products I keep coming back to.',
      items: [
        {
          title: 'SpaceX',
          tagline:
            'Reusable rockets, Starship, and making life multiplanetary.',
          href: 'https://www.spacex.com/',
        },
        {
          title: 'Tesla',
          tagline: 'Electric vehicles, energy systems, and humanoid robotics.',
          href: 'https://www.tesla.com/',
        },
        {
          title: 'Apple',
          tagline: 'Thoughtful hardware, software, and product design.',
          href: 'https://www.apple.com/',
        },
        {
          title: 'Bryan Johnson - Blueprint',
          tagline: 'Health, longevity, and the Blueprint protocol.',
          href: 'https://blueprint.bryanjohnson.com/',
        },
        {
          title: 'Oura Ring',
          tagline: 'Smart ring for sleep, readiness, and activity.',
          href: 'https://ouraring.com/',
        },
        {
          title: 'Philips Hue',
          tagline: 'Smart lighting for every room in your home.',
          href: 'https://www.philips-hue.com/',
        },
        {
          title: 'Aqara',
          tagline: 'Smart home devices, sensors, and automation.',
          href: 'https://www.aqara.com/en/',
        },
        {
          title: 'DOOA',
          tagline: 'Aquascaping tools and design for planted tanks.',
          href: 'https://dooa.jp/en/',
        },
      ],
    },
    {
      id: 'bookshelf',
      type: 'books',
      size: { sm: '4x4', md: '4x5' },
      title: 'Books',
      description: 'Books I keep revisiting and recommending.',
      items: [
        {
          href: 'https://a.co/d/09PSjG9f',
          title: 'The Book of Elon: A Guide to Purpose and Success',
          subtitle: 'Eric Jorgenson',
          artwork:
            'https://m.media-amazon.com/images/I/61elAycARIL._SY522_.jpg',
        },
        {
          href: 'https://a.co/d/0cLY6XV4',
          title: 'The Almanack of Naval Ravikant',
          subtitle: 'Eric Jorgenson',
          artwork: 'https://m.media-amazon.com/images/I/31qUHjE8jHL.jpg',
        },
        {
          href: 'https://a.co/d/07lLpXlU',
          title: 'Play Bigger',
          subtitle: 'Al Ramadan',
          artwork:
            'https://m.media-amazon.com/images/I/71Rkr45BzpL._SY522_.jpg',
        },
        {
          href: 'https://a.co/d/0dQLM71m',
          title: 'Zero to One',
          subtitle: 'Peter Thiel, Blake Masters',
          artwork:
            'https://m.media-amazon.com/images/I/71r+KgczQmL._SX522_.jpg',
        },
        {
          href: 'https://a.co/d/0cJb0Z7M',
          title: 'The Lean Startup',
          subtitle: 'Eric Ries',
          artwork:
            'https://m.media-amazon.com/images/I/71mhBrysFaL._SX522_.jpg',
        },
        {
          href: 'https://a.co/d/0g2fSI2T',
          title: 'How to Love',
          subtitle: 'Thich Nhat Hanh',
          artwork:
            'https://m.media-amazon.com/images/I/71hKawuM6rL._SY522_.jpg',
        },
        {
          href: 'https://a.co/d/01fCvxhV',
          title: '$100M Leads',
          subtitle: 'Alex Hormozi',
          artwork:
            'https://m.media-amazon.com/images/I/71p5RV3janL._SY522_.jpg',
        },
        {
          href: 'https://a.co/d/01FsXQbP',
          title: 'Start with Why',
          subtitle: 'Simon Sinek',
          artwork:
            'https://m.media-amazon.com/images/I/71NBZIExBCL._SY522_.jpg',
        },
      ],
    },
  ],
};

export function getSiteCardTitle(card: SiteCard): string {
  switch (card.type) {
    case 'link':
      return card.label ?? card.href;
    case 'note':
      return 'Note';
    case 'image':
      return card.caption ?? 'Image';
    case 'map':
      return card.label ?? 'Map';
    case 'github':
      return `GitHub ${card.username}`;
    case 'email-collect':
      return card.heading ?? 'Email collect';
    case 'countdown':
      return card.title ?? 'Countdown';
    case 'weather':
      return card.locationName ?? 'Weather';
    case 'twitter':
      return `Tweet ${card.tweetId}`;
    case 'music':
      return 'Music';
    case 'podcasts':
      return card.title ?? 'Podcasts';
    case 'youtube-channels':
      return card.title ?? 'YouTube channels';
    case 'books':
      return card.title ?? 'Books';
    case 'favorites':
      return card.title ?? 'Favorites';
    case 'calendar':
      return card.title ?? 'Calendar';
    case 'views':
      return 'Views';
  }
}
