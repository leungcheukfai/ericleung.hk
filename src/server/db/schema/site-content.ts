import { jsonb, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

export const siteContent = pgTable('site_content', {
  key: varchar('key', { length: 64 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
