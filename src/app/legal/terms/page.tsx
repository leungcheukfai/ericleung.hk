import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';
import type { Metadata } from 'next';

const PATH = '/legal/terms';

export const metadata: Metadata = {
  ...defaultMetadata,
  title: `Terms of Service · ${siteConfig.title}`,
  description: `Terms for using ${siteConfig.domain}.`,
  alternates: {
    canonical: PATH,
  },
  openGraph: {
    ...ogMetadata,
    title: `Terms of Service · ${siteConfig.title}`,
    description: `Terms for using ${siteConfig.domain}.`,
    url: `${getSiteOrigin()}${PATH}`,
  },
  twitter: {
    ...twitterMetadata,
    title: `Terms of Service · ${siteConfig.title}`,
    description: `Terms for using ${siteConfig.domain}.`,
  },
};

export default function TermsOfServicePage() {
  const domain = siteConfig.domain;
  const siteUrl = getSiteOrigin();

  return (
    <article className="rounded-3xl border border-border bg-background/80 px-6 py-10 text-foreground backdrop-blur-sm md:px-10">
      <h1 className="font-[family-name:var(--font-calsans)] text-3xl tracking-tight md:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Last updated: May 3, 2026 · Personal website at{' '}
        <span className="text-foreground">{domain}</span>
      </p>

      <div className="mt-10 flex max-w-none flex-col gap-8 text-base text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:scroll-mt-24 [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:text-xl [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-4 [&_ul]:pl-6 [&_ul]:marker:text-muted-foreground">
        <p>
          These terms govern your access to and use of {domain} (the “Site”).
        </p>
        <p>
          By visiting or using the Site, you agree to these terms. If you do not
          agree, please do not use the Site.
        </p>

        <h2>Nature of the Site</h2>
        <p>
          The Site is a personal website operated by {siteConfig.profile.name}.
          Content is provided for general information and personal expression.
        </p>
        <p>
          <strong>Nothing on the Site is professional advice</strong> (including
          legal, financial, medical, or other specialized advice), unless
          explicitly stated in writing for a specific engagement outside these
          terms.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Unless otherwise noted, text, images, layout, branding, and original
          materials on the Site are owned by {siteConfig.profile.name} or used
          with permission, and are protected by applicable intellectual property
          laws.
        </p>
        <p>
          Open-source components may be used under their respective licenses
          (see links on the homepage where applicable).
        </p>
        <p>
          You may view and share links to the Site for personal, non-commercial
          purposes. You may not copy, scrape, republish, or exploit substantial
          portions of the Site without prior written consent, except where fair
          use or open-source licenses expressly allow.
        </p>

        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Site in any way that violates applicable law;</li>
          <li>
            Attempt to disrupt, overload, or gain unauthorized access to systems
            or data related to the Site;
          </li>
          <li>
            Use automated means to access the Site in a manner that impairs
            service for others;
          </li>
          <li>Misrepresent your affiliation with {siteConfig.profile.name}.</li>
        </ul>

        <h2>Third-party links and embeds</h2>
        <p>
          The Site may link to or embed third-party websites and services. We do
          not control those services and are not responsible for their content,
          policies, or practices.
        </p>
        <p>
          Your use of third-party services is at your own risk and subject to
          their terms.
        </p>

        <h2>Disclaimer of warranties</h2>
        <p>
          THE SITE AND ALL CONTENT ARE PROVIDED{' '}
          <strong>“AS IS” AND “AS AVAILABLE”</strong> WITHOUT WARRANTIES OF ANY
          KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY LAW.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, {siteConfig.profile.name} WILL
          NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING
          OUT OF OR RELATED TO YOUR USE OF THE SITE, EVEN IF ADVISED OF THE
          POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING
          OUT OF THE SITE WILL NOT EXCEED THE GREATER OF (A) AMOUNTS YOU PAID US
          FOR ACCESS TO THE SITE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B)
          ONE HUNDRED HONG KONG DOLLARS (HK$100), IF YOU HAVE PAID NOTHING.
        </p>

        <h2>Indemnity</h2>
        <p>
          To the extent permitted by law, you agree to indemnify and hold
          harmless {siteConfig.profile.name} from claims, damages, losses, or
          expenses arising from your misuse of the Site or violation of these
          terms.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. The updated terms will be
          posted on this page with a revised “Last updated” date.
        </p>
        <p>
          Continued use of the Site after changes constitutes acceptance of the
          new terms.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of the Hong Kong Special
          Administrative Region, without regard to conflict-of-law principles,
          except where mandatory consumer protections in your jurisdiction
          apply.
        </p>

        <h2>Severability</h2>
        <p>
          If any provision is held invalid or unenforceable, the remaining
          provisions remain in effect.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these terms, please reach out via the contact
          options on <a href={siteUrl}>{domain}</a>.
        </p>
      </div>
    </article>
  );
}
