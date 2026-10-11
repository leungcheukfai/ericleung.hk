import ArticleView from '@/components/site/article-view';
import { getPreview } from '@/lib/rankowl';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// A private preview of an unpublished RankOwl article: never cached, never indexed.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preview = await getPreview(id);
  if (!preview) {
    notFound();
  }
  return (
    <>
      <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-foreground text-sm">
        Preview · not published ({preview.status}). Only people with this link
        can see it.
      </p>
      <ArticleView article={preview.article} />
    </>
  );
}
