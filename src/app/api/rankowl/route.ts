import { createHmac, timingSafeEqual } from 'node:crypto';
import { RANKOWL_TAG } from '@/lib/rankowl';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * RankOwl's webhook: called on every publish and update with the article, signed
 * `X-RankOwl-Signature: sha256=<HMAC of the body with the site key>`. Refreshes the blog at once.
 */
export async function POST(request: Request) {
  const key = process.env.RANKOWL_SITE_KEY;
  if (!key) {
    return Response.json({ error: 'not configured' }, { status: 503 });
  }
  const body = await request.text();
  const expected = Buffer.from(
    `sha256=${createHmac('sha256', key).update(body).digest('hex')}`
  );
  const given = Buffer.from(request.headers.get('x-rankowl-signature') ?? '');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: 'bad signature' }, { status: 401 });
  }
  const payload = JSON.parse(body) as { article?: { slug?: string } };
  // Readers should see the new article now, not a stale page while it refreshes.
  revalidateTag(RANKOWL_TAG, { expire: 0 });
  revalidatePath('/blog');
  if (payload.article?.slug) {
    revalidatePath(`/blog/${payload.article.slug}`);
  }
  revalidatePath('/sitemap.xml');
  return Response.json({ ok: true });
}
