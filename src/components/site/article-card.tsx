import type { RankOwlArticle } from '@/lib/rankowl';
import Link from 'next/link';

export function formatDate(iso: string, month: 'short' | 'long' = 'short') {
  return new Date(iso).toLocaleDateString('en-HK', {
    year: 'numeric',
    month,
    day: 'numeric',
  });
}

/** An article as a bento card, matching the home page grid. */
export default function ArticleCard({ article }: { article: RankOwlArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group hover:-translate-y-0.5 flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-border/80 hover:shadow-md"
    >
      {article.headerImage ? (
        // biome-ignore lint/nursery/noImgElement: remote images from RankOwl's blob store
        <img
          src={article.headerImage.url}
          alt={article.headerImage.alt}
          width={article.headerImage.width ?? 1536}
          height={article.headerImage.height ?? 1024}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      ) : null}
      <span className="flex flex-1 flex-col gap-2 p-5">
        <span className="font-cal text-foreground text-lg leading-snug">
          {article.title}
        </span>
        <span className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
          {article.metaDescription || article.excerpt}
        </span>
        {article.publishedAt ? (
          <time
            dateTime={article.publishedAt}
            className="mt-auto pt-1 text-muted-foreground text-xs"
          >
            {formatDate(article.publishedAt)}
          </time>
        ) : null}
      </span>
    </Link>
  );
}
