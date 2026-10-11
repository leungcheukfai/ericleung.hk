import { formatDate } from '@/components/site/article-card';
import { siteConfig } from '@/content/site';
import type { RankOwlArticle } from '@/lib/rankowl';
import Image from 'next/image';
import Link from 'next/link';

/** One article as the blog shows it; shared by the live page and the private preview. */
export default function ArticleView({ article }: { article: RankOwlArticle }) {
  const { profile } = siteConfig;
  return (
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
          className="h-auto w-full rounded-2xl border border-border shadow-sm"
        />
      ) : null}
      {/* RankOwl's own HTML, schema.org JSON-LD included, rendered on the server so crawlers see all of it. */}
      <div
        className="flex max-w-none flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-base text-muted-foreground leading-relaxed shadow-sm md:p-10 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-border [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-foreground [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_h2]:mt-6 [&_h2]:scroll-mt-24 [&_h2]:font-cal [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-lg [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-2xl [&_img]:h-auto [&_img]:w-full [&_img]:rounded-2xl [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-foreground [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: content comes from this site's own RankOwl account
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
    </article>
  );
}
