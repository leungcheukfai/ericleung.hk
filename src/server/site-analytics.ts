import { getSiteCardTitle, siteConfig } from '@/content/site';
import { UAParser } from 'ua-parser-js';
import { and, count, countDistinct, desc, eq, gte, sql } from 'drizzle-orm';
import { db } from './db/db';
import { siteClick, siteSubscriber, siteView } from './db/schema';

export type RequestMeta = {
  ip: string;
  userAgent: string;
  referrer?: string;
  country?: string;
};

export type SiteMetricsSummary = Awaited<ReturnType<typeof getPublicSiteSummary>>;

export async function recordSiteView(meta: RequestMeta) {
  const exists = await db.query.siteView.findFirst({
    where: (view, { and, eq, sql }) =>
      and(
        eq(view.ip, meta.ip),
        sql`created_at > now() - interval '1 hour'`
      ),
    columns: { id: true },
  });

  if (!exists) {
    await db.insert(siteView).values(meta);
  }
}

export async function recordSiteClick(
  payload: {
    cardId: string;
    href: string;
  },
  meta: RequestMeta
) {
  await db.insert(siteClick).values({
    cardId: payload.cardId,
    href: payload.href,
    ip: meta.ip,
    userAgent: meta.userAgent,
    referrer: meta.referrer,
  });
}

export async function addSiteSubscriber(email: string) {
  const normalized = email.trim().toLowerCase();
  const existing = await db.query.siteSubscriber.findFirst({
    where: (subscriber, { eq }) => eq(subscriber.email, normalized),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(siteSubscriber)
    .values({ email: normalized })
    .returning();

  return created;
}

export async function getSiteSubscribers() {
  return db.query.siteSubscriber.findMany({
    orderBy: (subscriber, { desc }) => desc(subscriber.createdAt),
  });
}

export async function getPublicSiteSummary() {
  const [viewsResult, uniqueResult, clicksResult, subscribersResult] =
    await Promise.all([
      db.select({ count: count() }).from(siteView),
      db.select({ count: countDistinct(siteView.ip) }).from(siteView),
      db.select({ count: count() }).from(siteClick),
      db.select({ count: count() }).from(siteSubscriber),
    ]);

  return {
    totalViews: Number(viewsResult[0]?.count ?? 0),
    uniqueVisitors: Number(uniqueResult[0]?.count ?? 0),
    totalClicks: Number(clicksResult[0]?.count ?? 0),
    totalSubscribers: Number(subscribersResult[0]?.count ?? 0),
  };
}

export async function getSiteTrafficSeries(days: number) {
  const [viewRows, clickRows] = await Promise.all([
    db
      .select({
        date: sql<string>`date_trunc('day', ${siteView.createdAt})::date`.as(
          'date'
        ),
        count: sql<number>`count(*)`.as('count'),
      })
      .from(siteView)
      .where(gte(siteView.createdAt, sql`now() - ${`${days} days`}::interval`))
      .groupBy(sql`date_trunc('day', ${siteView.createdAt})::date`)
      .orderBy(sql`date_trunc('day', ${siteView.createdAt})::date`),
    db
      .select({
        date: sql<string>`date_trunc('day', ${siteClick.createdAt})::date`.as(
          'date'
        ),
        count: sql<number>`count(*)`.as('count'),
      })
      .from(siteClick)
      .where(
        gte(siteClick.createdAt, sql`now() - ${`${days} days`}::interval`)
      )
      .groupBy(sql`date_trunc('day', ${siteClick.createdAt})::date`)
      .orderBy(sql`date_trunc('day', ${siteClick.createdAt})::date`),
  ]);

  const counts = new Map<string, { views: number; clicks: number }>();
  for (const row of viewRows) {
    counts.set(row.date, {
      views: Number(row.count),
      clicks: counts.get(row.date)?.clicks ?? 0,
    });
  }
  for (const row of clickRows) {
    counts.set(row.date, {
      views: counts.get(row.date)?.views ?? 0,
      clicks: Number(row.count),
    });
  }

  return [...counts.entries()]
    .map(([date, values]) => ({
      date,
      views: values.views,
      clicks: values.clicks,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopCards(days: number) {
  const rows = await db
    .select({
      cardId: siteClick.cardId,
      href: siteClick.href,
      count: sql<number>`count(*)`.as('count'),
    })
    .from(siteClick)
    .where(gte(siteClick.createdAt, sql`now() - ${`${days} days`}::interval`))
    .groupBy(siteClick.cardId, siteClick.href)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return rows.map((row) => {
    const card = siteConfig.cards.find((candidate) => candidate.id === row.cardId);
    return {
      cardId: row.cardId,
      href: row.href,
      count: Number(row.count),
      label: card ? getSiteCardTitle(card) : row.cardId,
    };
  });
}

export async function getTopReferrers(days: number) {
  const rows = await db
    .select({
      referrer: sql<string>`coalesce(${siteView.referrer}, 'Direct')`.as(
        'referrer'
      ),
      count: sql<number>`count(*)`.as('count'),
    })
    .from(siteView)
    .where(gte(siteView.createdAt, sql`now() - ${`${days} days`}::interval`))
    .groupBy(sql`coalesce(${siteView.referrer}, 'Direct')`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return rows.map((row) => ({
    referrer: row.referrer,
    count: Number(row.count),
  }));
}

export async function getDeviceBreakdown(days: number) {
  const rows = await db
    .select({ userAgent: siteView.userAgent })
    .from(siteView)
    .where(gte(siteView.createdAt, sql`now() - ${`${days} days`}::interval`));

  const devices: Record<string, number> = {};
  const browsers: Record<string, number> = {};

  for (const row of rows) {
    const ua = UAParser(row.userAgent ?? undefined);
    const device = ua.device.type || 'desktop';
    const browser = ua.browser.name || 'Unknown';

    devices[device] = (devices[device] ?? 0) + 1;
    browsers[browser] = (browsers[browser] ?? 0) + 1;
  }

  return {
    devices: Object.entries(devices)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count),
    browsers: Object.entries(browsers)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getGeoBreakdown(days: number) {
  const rows = await db
    .select({
      country: sql<string>`coalesce(${siteView.country}, 'Unknown')`.as(
        'country'
      ),
      count: count(),
    })
    .from(siteView)
    .where(gte(siteView.createdAt, sql`now() - ${`${days} days`}::interval`))
    .groupBy(siteView.country)
    .orderBy(desc(count()))
    .limit(20);

  return rows.map((row) => ({
    country: row.country,
    count: Number(row.count),
  }));
}
