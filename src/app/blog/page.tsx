import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import { siteConfig } from '@/content/site';
import { listArticles } from '@/lib/rankowl';
import { getSiteOrigin } from '@/lib/site-url';
import type { Metadata } from 'next';
import Link from 'next/link';

const PATH = '/blog';
const TITLE = `Blog · ${siteConfig.title}`;
const DESCRIPTION = `Articles from ${siteConfig.domain}.`;

export const revalidate = 600;

export const metadata: Metadata = {
  ...defaultMetadata,
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    ...ogMetadata,
    title: TITLE,
    description: DESCRIPTION,
    url: `${getSiteOrigin()}${PATH}`,
  },
  twitter: { ...twitterMetadata, title: TITLE, description: DESCRIPTION },
};

export default async function BlogPage() {
  const articles = await listArticles();
  return (
    <section className="flex flex-col gap-8">
      <h1 className="font-[family-name:var(--font-calsans)] text-3xl tracking-tight md:text-4xl">
        Blog
      </h1>
      {articles.length === 0 ? (
        <p className="text-muted-foreground">No articles yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`/blog/${article.slug}`}
                className="group flex flex-col gap-3 rounded-3xl border border-border bg-background/80 p-5 backdrop-blur-sm transition-colors hover:bg-background md:flex-row md:items-start"
              >
                {article.headerImage ? (
                  // biome-ignore lint/nursery/noImgElement: remote images from RankOwl's blob store
                  <img
                    src={article.headerImage.url}
                    alt={article.headerImage.alt}
                    width={article.headerImage.width ?? 1536}
                    height={article.headerImage.height ?? 1024}
                    loading="lazy"
                    className="aspect-[3/2] w-full rounded-2xl object-cover md:w-48 md:flex-none"
                  />
                ) : null}
                <span className="flex flex-col gap-1.5">
                  <span className="font-semibold text-foreground text-lg leading-snug group-hover:underline">
                    {article.title}
                  </span>
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {article.metaDescription || article.excerpt}
                  </span>
                  {article.publishedAt ? (
                    <time
                      dateTime={article.publishedAt}
                      className="text-muted-foreground text-xs"
                    >
                      {new Date(article.publishedAt).toLocaleDateString(
                        'en-HK',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </time>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
