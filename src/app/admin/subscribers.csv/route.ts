import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSiteSubscribers } from '@/server/site-analytics';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return new Response('Unauthorized', { status: 401 });
  }

  const subscribers = await getSiteSubscribers();
  const rows = [
    ['email', 'created_at'],
    ...subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.createdAt.toISOString(),
    ]),
  ];

  const body = rows
    .map((row) =>
      row
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(',')
    )
    .join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="site-subscribers.csv"',
    },
  });
}
