function normalizeOrigin(value: string) {
  const origin = value.startsWith('http') ? value : `https://${value}`;
  return origin.replace(/\/$/, '');
}

export function getSiteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeOrigin(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL);
  }

  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
    return normalizeOrigin(process.env.VERCEL_URL);
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

