import {
  defaultMetadata,
  ogMetadata,
  twitterMetadata,
} from '@/app/shared-metadata';
import ArticleCard from '@/components/site/article-card';
import { siteConfig } from '@/content/site';
import { listArticles } from '@/lib/rankowl';
import { getSiteOrigin } from '@/lib/site-url';
import type { Metadata } from 'next';

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
    <section className="flex animate-fade-in flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-cal text-4xl text-foreground md:text-5xl">Blog</h1>
        <p className="text-muted-foreground">
          Notes from {siteConfig.profile.name}.
        </p>
      </div>
      {articles.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-muted-foreground shadow-sm">
          No articles yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
