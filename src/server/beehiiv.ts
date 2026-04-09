import { env } from '@/env.mjs';
import { getSiteOrigin } from '@/lib/site-url';

const BEEHIIV_API_ROOT = 'https://api.beehiiv.com/v2';
const EXISTING_SUBSCRIPTION_ERROR = /already|exist/i;

type BeehiivSubscription = {
  id: string;
  email: string;
  status: string;
};

type BeehiivEnvelope = {
  data?: BeehiivSubscription;
  error?: string;
  message?: string;
  errors?: Array<{
    message?: string;
  }>;
};

export class BeehiivConfigError extends Error {
  constructor() {
    super('Beehiiv is not configured.');
  }
}

export class BeehiivRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getBeehiivConfig() {
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    throw new BeehiivConfigError();
  }

  return {
    apiKey: env.BEEHIIV_API_KEY,
    publicationId: env.BEEHIIV_PUBLICATION_ID,
  };
}

async function parseEnvelope(response: Response) {
  try {
    return (await response.json()) as BeehiivEnvelope;
  } catch {
    return null;
  }
}

function getErrorMessage(payload: BeehiivEnvelope | null, status: number) {
  const nested = payload?.errors
    ?.map((entry) => entry.message?.trim())
    .filter(Boolean)
    .join(' ');

  return (
    nested ||
    payload?.error?.trim() ||
    payload?.message?.trim() ||
    `Beehiiv request failed with status ${status}.`
  );
}

function isExistingActive(status: string) {
  return status === 'active' || status === 'validating';
}

function beehiivFetch(path: string, init?: RequestInit) {
  const { apiKey, publicationId } = getBeehiivConfig();
  const headers = new Headers(init?.headers);

  headers.set('Authorization', `Bearer ${apiKey}`);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${BEEHIIV_API_ROOT}/publications/${publicationId}${path}`, {
    ...init,
    headers,
  });
}

async function getSubscriptionByEmail(email: string) {
  const response = await beehiivFetch(
    `/subscriptions/by_email/${encodeURIComponent(email)}`
  );

  if (response.status === 404) {
    return null;
  }

  const payload = await parseEnvelope(response);

  if (!response.ok) {
    throw new BeehiivRequestError(
      getErrorMessage(payload, response.status),
      response.status
    );
  }

  if (!payload?.data) {
    throw new BeehiivRequestError(
      'Beehiiv returned an unexpected subscription response.',
      response.status
    );
  }

  return payload.data;
}

type SubscribeToBeehiivInput = {
  email: string;
  referringSite?: string;
};

export async function subscribeToBeehiiv({
  email,
  referringSite,
}: SubscribeToBeehiivInput) {
  const existing = await getSubscriptionByEmail(email);

  if (existing && isExistingActive(existing.status)) {
    return existing;
  }

  const response = await beehiivFetch('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: true,
      double_opt_override: 'not_set',
      utm_source: 'ericleung.hk',
      utm_medium: 'website',
      utm_campaign: 'homepage-subscribe',
      utm_content: 'stay-in-the-loop-card',
      referring_site: referringSite ?? getSiteOrigin(),
    }),
  });

  const payload = await parseEnvelope(response);

  if (!response.ok) {
    const message = getErrorMessage(payload, response.status);

    if (response.status === 400 && EXISTING_SUBSCRIPTION_ERROR.test(message)) {
      const fallback = await getSubscriptionByEmail(email);
      if (fallback && isExistingActive(fallback.status)) {
        return fallback;
      }
    }

    throw new BeehiivRequestError(message, response.status);
  }

  if (!payload?.data) {
    throw new BeehiivRequestError(
      'Beehiiv returned an unexpected subscription response.',
      response.status
    );
  }

  return payload.data;
}
