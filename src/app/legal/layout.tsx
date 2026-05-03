import SiteThemeWrapper from '@/components/site/theme-wrapper';
import { siteConfig } from '@/content/site';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <SiteThemeWrapper
      themeName={siteConfig.theme.preset}
      darkMode={siteConfig.theme.darkMode}
      accentColor={siteConfig.theme.accentColor}
    >
      <main className="container mx-auto min-h-screen w-full px-4 pt-12 pb-16">
        <div className="mx-auto max-w-2xl">
          <nav className="mb-10">
            <Link
              href="/"
              className="font-medium text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-foreground"
            >
              ← Back to {siteConfig.domain}
            </Link>
          </nav>
          {children}
        </div>
      </main>
    </SiteThemeWrapper>
  );
}
