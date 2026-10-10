import { siteConfig } from '@/content/site';

/** Site footer card, shared by the home page and the blog. */
export default function SiteFooter() {
  return (
    <footer className="animate-fade-in py-8 text-center">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-background/80 px-5 py-4 text-center text-muted-foreground text-sm backdrop-blur-sm">
        <p>{siteConfig.footer.notice}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a
            className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            href={siteConfig.footer.sourceHref}
            target="_blank"
            rel="noreferrer"
          >
            {siteConfig.footer.sourceLabel}
          </a>
          <a
            className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            href={siteConfig.footer.upstreamHref}
            target="_blank"
            rel="noreferrer"
          >
            {siteConfig.footer.upstreamLabel}
          </a>
          <a
            className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            href={siteConfig.footer.licenseHref}
            target="_blank"
            rel="noreferrer"
          >
            {siteConfig.footer.licenseLabel}
          </a>
          <a
            className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            href="/legal/privacy"
          >
            Privacy Policy
          </a>
          <a
            className="font-medium text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            href="/legal/terms"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
