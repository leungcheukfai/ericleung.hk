import { env } from '@/env.mjs';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

function isLocalDatabase(url: string) {
  const hostname = new URL(url).hostname;
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  );
}

const createLocalDb = () =>
  drizzlePg(new Pool({ connectionString: env.DATABASE_URL }), { schema });

type LocalDb = ReturnType<typeof createLocalDb>;

export const db: LocalDb = isLocalDatabase(env.DATABASE_URL)
  ? createLocalDb()
  : (drizzle(neon(env.DATABASE_URL), { schema }) as unknown as LocalDb);
