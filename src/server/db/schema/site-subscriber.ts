import { pgTable, text, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

export const siteSubscriber = pgTable(
  'site_subscriber',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    siteSubscriberEmailIdx: uniqueIndex('site_subscriber_email_idx').on(
      table.email
    ),
  })
);

