import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';
import type { Metadata } from 'next';

const PATH = '/legal/privacy';

export const metadata: Metadata = {
  ...defaultMetadata,
  title: `Privacy Policy · ${siteConfig.title}`,
  description: `How ${siteConfig.domain} handles visitor information.`,
  alternates: {
    canonical: PATH,
  },
  openGraph: {
    ...ogMetadata,
    title: `Privacy Policy · ${siteConfig.title}`,
    description: `How ${siteConfig.domain} handles visitor information.`,
    url: `${getSiteOrigin()}${PATH}`,
  },
  twitter: {
    ...twitterMetadata,
    title: `Privacy Policy · ${siteConfig.title}`,
    description: `How ${siteConfig.domain} handles visitor information.`,
  },
};

export default function PrivacyPolicyPage() {
  const domain = siteConfig.domain;
  const siteUrl = getSiteOrigin();

  return (
    <article className="rounded-3xl border border-border bg-background/80 px-6 py-10 text-foreground backdrop-blur-sm md:px-10">
      <h1 className="font-[family-name:var(--font-calsans)] text-3xl tracking-tight md:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Last updated: May 3, 2026 · Personal website at{' '}
        <span className="text-foreground">{domain}</span>
      </p>

      <div className="mt-10 flex max-w-none flex-col gap-8 text-base text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:scroll-mt-24 [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:text-xl [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-4 [&_ul]:pl-6 [&_ul]:marker:text-muted-foreground">
        <p>
          This policy describes how {siteConfig.profile.name} (“we”, “us”)
          collects and uses information when you visit {domain}.
        </p>
        <p>
          This is a simple personal site. We collect only what is needed to
          operate it and improve basic traffic insights.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Usage and analytics.</strong> We use Vercel Analytics to
            understand aggregate traffic (for example, page views and
            performance). You can read more in{' '}
            <a href="https://vercel.com/docs/analytics/privacy-policy">
              Vercel’s analytics privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Site analytics (first-party).</strong> When you load pages
            on this site, our servers may record technical data such as
            approximate location (country/region when provided by the hosting
            network), referrer, browser type (user agent), and a truncated or
            forwarded IP address as supplied by standard HTTP headers. This
            helps measure visits and improve the site.
          </li>
          <li>
            <strong>Newsletter.</strong> If you choose to subscribe, we collect
            your email address to send updates. Subscription may be processed
            through our newsletter provider (for example, Beehiiv). Their
            privacy practices apply to how they store and send mail on our
            behalf.
          </li>
        </ul>

        <h2>Cookies and similar technologies</h2>
        <p>
          Our hosting and analytics providers may use cookies or similar
          technologies. You can control cookies through your browser settings.
        </p>

        <h2>How we use information</h2>
        <p>
          We use the information above to run and secure the website, measure
          aggregate traffic, and deliver newsletters you explicitly request. We
          do not sell your personal information.
        </p>

        <h2>Retention</h2>
        <p>
          Analytics and server logs may be retained for a limited period as
          required for operations and security. Newsletter data is kept as long
          as your subscription stays active or as needed to comply with law.
        </p>

        <h2>Third-party services</h2>
        <p>
          The site may embed or link to third-party content (for example, maps,
          music players, social profiles, or calendars).
        </p>
        <p>
          Those services have their own privacy policies, which govern data they
          collect when you interact with them.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>
            Use browser controls to block or delete cookies where supported.
          </li>
          <li>
            Unsubscribe from newsletters using the link included in any email we
            send, or by contacting us as below.
          </li>
        </ul>

        <h2>Children</h2>
        <p>
          This site is not directed at children under 13, and we do not
          knowingly collect their personal information.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy occasionally. The “Last updated” date at the
          top will change when we do.
        </p>
        <p>
          Continued use of the site after changes means you accept the revised
          policy.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent via the contact options listed
          on <a href={siteUrl}>{domain}</a>.
        </p>
      </div>
    </article>
  );
}
