import TrafficChart from '@/components/site/traffic-chart';
import {
  adminSessionCookie,
  isAdminAuthenticated,
  isAdminConfigured,
} from '@/lib/admin-auth';
import {
  getDeviceBreakdown,
  getGeoBreakdown,
  getPublicSiteSummary,
  getSiteSubscribers,
  getSiteTrafficSeries,
  getTopCards,
  getTopReferrers,
} from '@/server/site-analytics';
import { LockKeyhole, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 font-cal text-3xl">{value}</p>
    </div>
  );
}

function TableCard({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <h2 className="font-cal text-xl">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-border/60 border-b text-muted-foreground">
              {columns.map((column) => (
                <th key={column} className="px-0 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.join(':')} className="border-border/40 border-b last:border-0">
                  {row.map((cell) => (
                    <td key={cell} className="px-0 py-3 pr-4 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-0 py-6 text-muted-foreground"
                >
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authenticated = await isAdminAuthenticated();
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  if (!authenticated) {
    if (!isAdminConfigured()) {
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
          <section className="w-full rounded-3xl border border-border/60 bg-card p-7 shadow-lg">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/50">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h1 className="mt-5 font-cal text-3xl">Admin</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Private admin is not configured. Set{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                SITE_ADMIN_PASSWORD
              </code>{' '}
              and{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
                ADMIN_SESSION_SECRET
              </code>{' '}
              (32+ characters) in your deployment environment, then redeploy.
            </p>
          </section>
        </main>
      );
    }

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
        <section className="w-full rounded-3xl border border-border/60 bg-card p-7 shadow-lg">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/50">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-cal text-3xl">Admin</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Enter your private site password to view analytics and subscribers.
          </p>

          <form action="/admin/login" method="post" className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="font-medium text-sm">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            {error === 'invalid' && (
              <p className="text-destructive text-sm">
                That password didn&apos;t match your admin password.
              </p>
            )}
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Unlock dashboard
            </button>
          </form>
        </section>
      </main>
    );
  }

  const [summary, traffic, topCards, referrers, deviceBreakdown, geo, subscribers] =
    await Promise.all([
      getPublicSiteSummary(),
      getSiteTrafficSeries(30),
      getTopCards(30),
      getTopReferrers(30),
      getDeviceBreakdown(30),
      getGeoBreakdown(30),
      getSiteSubscribers(),
    ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-10 md:px-8 md:py-14">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Private analytics</p>
          <h1 className="font-cal text-4xl">ericleung.hk admin</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Session cookie: <code>{adminSessionCookie.name}</code>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/admin/subscribers.csv"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border/60 bg-card px-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Export subscribers CSV
          </a>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border/60 bg-card px-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total views"
          value={summary.totalViews.toLocaleString()}
        />
        <StatCard
          label="Unique visitors"
          value={summary.uniqueVisitors.toLocaleString()}
        />
        <StatCard
          label="Link clicks"
          value={summary.totalClicks.toLocaleString()}
        />
        <StatCard
          label="Subscribers"
          value={summary.totalSubscribers.toLocaleString()}
        />
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-cal text-xl">Traffic over the last 30 days</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Views and outbound clicks recorded for your homepage.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <TrafficChart data={traffic} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <TableCard
          title="Top cards"
          columns={['Card', 'Destination', 'Clicks']}
          rows={topCards.map((row) => [row.label, row.href, row.count.toString()])}
        />
        <TableCard
          title="Top referrers"
          columns={['Referrer', 'Views']}
          rows={referrers.map((row) => [row.referrer, row.count.toString()])}
        />
        <TableCard
          title="Devices"
          columns={['Device', 'Views']}
          rows={deviceBreakdown.devices.map((row) => [
            row.device,
            row.count.toString(),
          ])}
        />
        <TableCard
          title="Browsers"
          columns={['Browser', 'Views']}
          rows={deviceBreakdown.browsers.map((row) => [
            row.browser,
            row.count.toString(),
          ])}
        />
        <TableCard
          title="Countries"
          columns={['Country', 'Views']}
          rows={geo.map((row) => [row.country, row.count.toString()])}
        />
        <TableCard
          title="Subscribers"
          columns={['Email', 'Added']}
          rows={subscribers.map((subscriber) => [
            subscriber.email,
            new Date(subscriber.createdAt).toLocaleString(),
          ])}
        />
      </section>
    </main>
  );
}
