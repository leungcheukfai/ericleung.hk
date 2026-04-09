import type { RequestMeta } from '@/server/site-analytics';

function getFirstHeaderValue(value: string | null) {
  return value?.split(',')[0]?.trim() ?? '';
}

export function getRequestMeta(headers: Headers): RequestMeta {
  const ip =
    getFirstHeaderValue(headers.get('x-forwarded-for')) ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown';

  const userAgent = headers.get('user-agent') ?? 'unknown';
  const referrer =
    headers.get('referer') ?? headers.get('referrer') ?? undefined;
  const country =
    headers.get('x-vercel-ip-country') ??
    headers.get('cf-ipcountry') ??
    undefined;

  return {
    ip,
    userAgent,
    referrer,
    country: country && country !== 'XX' ? country : undefined,
  };
}
