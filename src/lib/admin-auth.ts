import { env } from '@/env.mjs';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'ericleung_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function isAdminConfigured() {
  return Boolean(
    env.SITE_ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET
  );
}

function signValue(value: string) {
  const secret = env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured');
  }
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function hashSecret(value: string) {
  return createHash('sha256').update(value).digest();
}

function safeEqualText(a: string, b: string) {
  return timingSafeEqual(hashSecret(a), hashSecret(b));
}

export function isValidAdminPassword(value: string) {
  const password = env.SITE_ADMIN_PASSWORD;
  if (!password) {
    return false;
  }
  return safeEqualText(value, password);
}

export function createAdminSessionToken() {
  const payload: SessionPayload = {
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${signValue(encoded)}`;
}

function verifyAdminSessionToken(token: string) {
  if (!env.ADMIN_SESSION_SECRET) {
    return false;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return false;
  }

  const expected = signValue(encoded);
  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SessionPayload;
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyAdminSessionToken(token) : false;
}

export const adminSessionCookie = {
  name: SESSION_COOKIE,
  maxAge: SESSION_TTL_SECONDS,
};
