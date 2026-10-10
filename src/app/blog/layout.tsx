import BlogHeader from '@/components/site/blog-header';
import SiteFooter from '@/components/site/footer';
import SiteThemeWrapper from '@/components/site/theme-wrapper';
import { siteConfig } from '@/content/site';
import type { ReactNode } from 'react';

/** Same frame as the home page: theme, narrow column, header, footer card. */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <SiteThemeWrapper
      themeName={siteConfig.theme.preset}
      darkMode={siteConfig.theme.darkMode}
      accentColor={siteConfig.theme.accentColor}
    >
      <main className="container mx-auto flex min-h-screen w-full flex-col items-center gap-y-5 px-4 pt-16 pb-16">
        <div className="h-full w-full max-w-3xl">
          <div className="flex flex-col gap-y-8">
            <div className="animate-fade-in">
              <BlogHeader />
            </div>
            {children}
            <SiteFooter />
          </div>
        </div>
      </main>
    </SiteThemeWrapper>
  );
}
