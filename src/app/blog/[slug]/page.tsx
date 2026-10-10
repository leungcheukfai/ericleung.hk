import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import { getArticle, listArticles } from '@/lib/rankowl';
import { getSiteOrigin } from '@/lib/site-url';
import type { Metadata } from 'next';
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
  const article = await getArticle(slug);
  if (!article) {
    notFound();
  }
  return (
    <article className="rounded-3xl border border-border bg-background/80 px-6 py-10 text-foreground backdrop-blur-sm md:px-10">
      <h1 className="font-[family-name:var(--font-calsans)] text-3xl tracking-tight md:text-4xl">
        {article.title}
      </h1>
      {article.publishedAt ? (
        <time
          dateTime={article.publishedAt}
          className="mt-2 block text-muted-foreground text-sm"
        >
          {new Date(article.publishedAt).toLocaleDateString('en-HK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      ) : null}
      {article.headerImage ? (
        // biome-ignore lint/nursery/noImgElement: remote images from RankOwl's blob store
        <img
          src={article.headerImage.url}
          alt={article.headerImage.alt}
          width={article.headerImage.width ?? 1536}
          height={article.headerImage.height ?? 1024}
          className="mt-8 aspect-[3/2] w-full rounded-2xl object-cover"
        />
      ) : null}
      {/* RankOwl's own HTML, schema.org JSON-LD included, rendered on the server so crawlers see all of it. */}
      <div
        className="mt-8 flex max-w-none flex-col gap-5 text-base text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-border [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-foreground [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_h2]:mt-6 [&_h2]:scroll-mt-24 [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-lg [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-2xl [&_img]:rounded-2xl [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-foreground [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: content comes from this site's own RankOwl account
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
    </article>
  );
}
