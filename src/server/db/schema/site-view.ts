import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const siteView = pgTable('site_view', {
  id: uuid('id').primaryKey().defaultRandom(),
  ip: text('ip').notNull(),
  userAgent: text('user_agent').notNull(),
  referrer: text('referrer'),
  country: varchar('country', { length: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

