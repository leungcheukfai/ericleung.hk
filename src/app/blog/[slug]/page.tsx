import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import ArticleCard, { formatDate } from '@/components/site/article-card';
import { siteConfig } from '@/content/site';
import { getArticle, listArticles } from '@/lib/rankowl';
import { getSiteOrigin } from '@/lib/site-url';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 600;
// Articles published after the build are rendered on first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await listArticles()).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return { ...defaultMetadata, title: 'Not found' };
  }
  const path = `/blog/${article.slug}`;
  const title = article.metaTitle || article.title;
  const images = article.headerImage
    ? [{ url: article.headerImage.url, alt: article.headerImage.alt }]
    : undefined;
  return {
    ...defaultMetadata,
    title,
    description: article.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      ...ogMetadata,
      type: 'article',
      title,
      description: article.metaDescription,
      url: `${getSiteOrigin()}${path}`,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      ...(images ? { images } : {}),
    },
    twitter: {
      ...twitterMetadata,
      title,
      description: article.metaDescription,
      ...(images ? { images } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, all] = await Promise.all([getArticle(slug), listArticles()]);
  if (!article) {
    notFound();
  }
  const more = all.filter((item) => item.slug !== article.slug).slice(0, 4);
  const { profile } = siteConfig;
  return (
    <>
      <article className="flex animate-fade-in flex-col gap-6">
        <header className="flex flex-col gap-4">
          <h1 className="font-cal text-4xl text-foreground leading-tight md:text-5xl">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt=""
                width={32}
                height={32}
                sizes="32px"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : null}
            <span>
              <Link
                href="/"
                className="font-medium text-foreground hover:underline"
              >
                {profile.name}
              </Link>
              {article.publishedAt ? (
                <>
                  {' · '}
                  <time dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt, 'long')}
                  </time>
                </>
              ) : null}
            </span>
          </div>
        </header>
        {article.headerImage ? (
          // biome-ignore lint/nursery/noImgElement: remote images from RankOwl's blob store
          <img
            src={article.headerImage.url}
            alt={article.headerImage.alt}
            width={article.headerImage.width ?? 1536}
            height={article.headerImage.height ?? 1024}
            className="aspect-[16/9] w-full rounded-2xl border border-border object-cover shadow-sm"
          />
        ) : null}
        {/* RankOwl's own HTML, schema.org JSON-LD included, rendered on the server so crawlers see all of it. */}
        <div
          className="flex max-w-none flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-base text-muted-foreground leading-relaxed shadow-sm md:p-10 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-border [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-foreground [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_h2]:mt-6 [&_h2]:scroll-mt-24 [&_h2]:font-cal [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-lg [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-2xl [&_img]:rounded-2xl [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-foreground [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: content comes from this site's own RankOwl account
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </article>
      {more.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-cal text-2xl text-foreground">
            More from the blog
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {more.map((item) => (
              <li key={item.id}>
                <ArticleCard article={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
