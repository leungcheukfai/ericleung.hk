'use client';

import { type ReactNode, createContext, useContext } from 'react';

export type SiteLocale = 'en' | 'zh';

/** Interface words on the cards and header, in Hong Kong written Chinese. Card content comes from site-zh.ts. */
const ZH: Record<string, string> = {
  Follow: '追蹤',
  Connect: '聯繫',
  Subscribe: '訂閱',
  Message: '傳訊息',
  Join: '加入',
  Email: '電郵',
  Open: '開啟',
  Visit: '前往',
  Listen: '收聽',
  'Listen on': '收聽：',
  'Current project': '進行中項目',
  "You're subscribed": '已成功訂閱',
  'Thanks for signing up.': '多謝你的訂閱。',
  'Book a time': '預約時間',
  podcast: '個播客',
  podcasts: '個播客',
  channel: '個頻道',
  channels: '個頻道',
  book: '本書',
  books: '本書',
  pick: '項推介',
  picks: '項推介',
  Share: '分享',
  Copied: '已複製',
  'Privacy Policy': '私隱政策',
  'Terms of Service': '使用條款',
};

const LocaleContext = createContext<SiteLocale>('en');

export function SiteLocaleProvider({
  locale,
  children,
}: { locale: SiteLocale; children: ReactNode }) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useSiteLocale(): SiteLocale {
  return useContext(LocaleContext);
}

export function useT(): (text: string) => string {
  const locale = useContext(LocaleContext);
  return (text) => (locale === 'zh' ? (ZH[text] ?? text) : text);
}

/** Translates a fixed interface string in place: <T>Follow</T>. English pages render it unchanged. */
export function T({ children }: { children: string }) {
  return <>{useT()(children)}</>;
}
