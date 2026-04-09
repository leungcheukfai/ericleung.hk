import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const siteClick = pgTable('site_click', {
  id: uuid('id').primaryKey().defaultRandom(),
  cardId: text('card_id').notNull(),
  href: text('href').notNull(),
  ip: text('ip').notNull(),
  userAgent: text('user_agent').notNull(),
  referrer: text('referrer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

