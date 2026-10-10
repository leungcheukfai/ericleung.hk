/**
 * Articles written in RankOwl (https://rankowl.ericleung.hk), read from its API with this
 * site's key. Cached under the `rankowl` tag: the webhook at /api/rankowl refreshes it the
 * moment an article publishes, and the 10-minute revalidate is the fallback.
 */

export type RankOwlArticle = {
  id: string;
  slug: string;
  url: string | null;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  html: string;
  markdown: string;
  headerImage: {
    url: string;
    alt: string;
    width: number | null;
    height: number | null;
  } | null;
  publishedAt: string | null;
  updatedAt: string;
};

export const RANKOWL_TAG = 'rankowl';

const TRAILING_SLASH = /\/$/;

function config() {
  const base = process.env.RANKOWL_API_URL?.replace(TRAILING_SLASH, '');
  const key = process.env.RANKOWL_SITE_KEY;
  return base && key ? { base, key } : null;
}

async function get<T>(path: string): Promise<T | null> {
  const settings = config();
  if (!settings) {
    return null;
  }
  try {
    const response = await fetch(`${settings.base}${path}`, {
      headers: { authorization: `Bearer ${settings.key}` },
      next: { revalidate: 600, tags: [RANKOWL_TAG] },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    // RankOwl being down should never take the site down: the blog just shows nothing new.
    return null;
  }
}

export async function listArticles(): Promise<RankOwlArticle[]> {
  const all: RankOwlArticle[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const result = await get<{ articles: RankOwlArticle[]; total: number }>(
      `/api/v1/articles?page=${page}&per_page=100`
    );
    if (!result) {
      break;
    }
    all.push(...result.articles);
    if (all.length >= result.total || result.articles.length === 0) {
      break;
    }
  }
  return all;
}

export async function getArticle(slug: string): Promise<RankOwlArticle | null> {
  const result = await get<{ article: RankOwlArticle }>(
    `/api/v1/articles/${encodeURIComponent(slug)}`
  );
  return result?.article ?? null;
}
