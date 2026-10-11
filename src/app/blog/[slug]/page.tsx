import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import ArticleCard from '@/components/site/article-card';
import ArticleView from '@/components/site/article-view';
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
  const [article, all] = await Promise.all([getArticle(slug), listArticles()]);
  if (!article) {
    notFound();
  }
  const more = all.filter((item) => item.slug !== article.slug).slice(0, 4);
  return (
    <>
      <ArticleView article={article} />
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
