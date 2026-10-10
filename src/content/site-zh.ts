import { type SiteCard, siteConfig } from '@/content/site';

/**
 * The /zh home page: the same site in Hong Kong written Chinese (書面語). Only wording changes;
 * links, cards and layout come from siteConfig, so the two pages never drift apart.
 */

export const zhTitle = '梁焯輝 Eric Leung';
export const zhMetaTitle = '梁焯輝 Eric Leung｜香港獨立開發者';
export const zhDescription =
  '梁焯輝（Eric Leung），香港獨立開發者，營運 AI 安全資訊平台 OwlEval，並創辦了 Unwire Launch。';

export const zhProfile: typeof siteConfig.profile = {
  ...siteConfig.profile,
  name: '梁焯輝',
  chineseName: 'Eric Leung',
  role: '獨立開發者',
  location: '香港',
  bioHtml:
    '<p>我是香港的獨立開發者，喜歡探索新興科技，特別是 AI 和智能家居。佛學帶給我很多啟發；我的夢想是有一天到太空旅行。</p>',
  actions: [
    { label: 'English', href: '/' },
    { label: '網誌', href: '/blog' },
  ],
};

export const zhFooterNotice = '本網站基於 OpenBio 修改，以 AGPL-3.0 授權發佈。';

/** Card wording by card id; anything not listed keeps its English text (names, handles, titles of shows and books). */
const CARD_TEXT: Record<
  string,
  {
    title?: string;
    description?: string;
    label?: string;
    heading?: string;
    buttonText?: string;
  }
> = {
  'unwire-launch-project': { description: '讓亞洲看見你的產品。' },
  'owleval-project': { description: '為網絡安全人員而設的 AI 安全資訊。' },
  'hong-kong-map': { label: '香港' },
  'book-a-time': { title: '預約時間', description: '預約 30 分鐘，和我聊聊' },
  newsletter: {
    heading: '訂閱更新',
    description: '訂閱最新科技資訊。',
    buttonText: '訂閱',
  },
  'weekly-podcasts': {
    title: '播客頻道',
    description: '我每星期都會收聽的節目。',
  },
  'youtube-channels': {
    title: 'YouTube 頻道',
    description: '我會持續追看的頻道。',
  },
  'things-i-like': {
    title: '我喜愛的',
    description: '我愛用的品牌、工具和產品。',
  },
  bookshelf: { title: '書架', description: '我一讀再讀、會推薦給朋友的書。' },
};

/** Project links matched by address, so cards re-created in /admin under new ids still translate. */
const LINK_TEXT: Record<string, { description: string }> = {
  'https://launch.unwire.hk': { description: '讓亞洲看見你的產品。' },
  'https://owleval.com': { description: '為網絡安全人員而設的 AI 安全資訊。' },
};

export function zhCards(cards: SiteCard[]): SiteCard[] {
  return cards.map((card) => {
    const byHref =
      card.type === 'link'
        ? LINK_TEXT[card.href.replace(/\/$/, '')]
        : undefined;
    const text = CARD_TEXT[card.id] ?? byHref;
    return text ? ({ ...card, ...text } as SiteCard) : card;
  });
}
