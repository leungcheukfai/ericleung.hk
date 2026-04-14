import { type SiteCard, siteConfig } from '@/content/site';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './db/db';
import { siteContent } from './db/schema';

const BENTO_SIZES = ['2x2', '2x4', '4x1', '4x2', '4x4', '4x5'] as const;
const SITE_CARDS_KEY = 'cards';
const MISSING_SITE_CONTENT_TABLE_RE =
  /site_content|relation .*site_content.* does not exist/i;
const optionalStringSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().optional()
);
const optionalUrlSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().url().optional()
);

const gridPositionSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

const siteCardBaseSchema = z.object({
  id: z.string().min(1),
  size: z.object({
    sm: z.enum(BENTO_SIZES),
    md: z.enum(BENTO_SIZES),
  }),
  position: z
    .object({
      sm: gridPositionSchema.optional(),
      md: gridPositionSchema.optional(),
    })
    .partial()
    .optional(),
});

const linkCardSchema = siteCardBaseSchema.extend({
  type: z.literal('link'),
  href: z.string().url(),
  label: optionalStringSchema,
  description: optionalStringSchema,
  variant: z.enum(['default', 'spotlight']).optional(),
});

const noteCardSchema = siteCardBaseSchema.extend({
  type: z.literal('note'),
  html: z.string(),
});

const imageCardSchema = siteCardBaseSchema.extend({
  type: z.literal('image'),
  url: z.string().url(),
  caption: optionalStringSchema,
  href: optionalUrlSchema,
});

const mapCardSchema = siteCardBaseSchema.extend({
  type: z.literal('map'),
  latitude: z.number(),
  longitude: z.number(),
  label: optionalStringSchema,
});

const githubCardSchema = siteCardBaseSchema.extend({
  type: z.literal('github'),
  username: z.string().min(1),
});

const emailCollectCardSchema = siteCardBaseSchema.extend({
  type: z.literal('email-collect'),
  heading: optionalStringSchema,
  description: optionalStringSchema,
  buttonText: optionalStringSchema,
});

const countdownCardSchema = siteCardBaseSchema.extend({
  type: z.literal('countdown'),
  title: optionalStringSchema,
  targetDate: z.string().min(1),
  emoji: optionalStringSchema,
  repeat: z.enum(['none', 'yearly', 'monthly', 'weekly']).optional(),
});

const weatherCardSchema = siteCardBaseSchema.extend({
  type: z.literal('weather'),
  latitude: z.number(),
  longitude: z.number(),
  locationName: optionalStringSchema,
});

const twitterCardSchema = siteCardBaseSchema.extend({
  type: z.literal('twitter'),
  tweetId: z.string().min(1),
});

const musicCardSchema = siteCardBaseSchema.extend({
  type: z.literal('music'),
  url: z.string().url(),
});

const podcastItemSchema = z.object({
  title: z.string().min(1),
  publisher: optionalStringSchema,
  href: optionalUrlSchema,
  artwork: optionalUrlSchema,
});

const podcastsCardSchema = siteCardBaseSchema.extend({
  type: z.literal('podcasts'),
  title: optionalStringSchema,
  description: optionalStringSchema,
  items: z.array(podcastItemSchema),
});

const youtubeItemSchema = z.object({
  href: z.string().url(),
  title: optionalStringSchema,
  artwork: optionalUrlSchema,
});

const youtubeChannelsCardSchema = siteCardBaseSchema.extend({
  type: z.literal('youtube-channels'),
  title: optionalStringSchema,
  description: optionalStringSchema,
  items: z.array(youtubeItemSchema),
});

const bookItemSchema = z.object({
  href: z.string().url(),
  title: optionalStringSchema,
  subtitle: optionalStringSchema,
  artwork: optionalUrlSchema,
});

const booksCardSchema = siteCardBaseSchema.extend({
  type: z.literal('books'),
  title: optionalStringSchema,
  description: optionalStringSchema,
  items: z.array(bookItemSchema),
});

const favoriteItemSchema = z.object({
  title: z.string().min(1),
  tagline: optionalStringSchema,
  href: z.string().url(),
});

const favoritesCardSchema = siteCardBaseSchema.extend({
  type: z.literal('favorites'),
  title: optionalStringSchema,
  description: optionalStringSchema,
  items: z.array(favoriteItemSchema),
});

const calendarCardSchema = siteCardBaseSchema.extend({
  type: z.literal('calendar'),
  url: z.string().url(),
  title: optionalStringSchema,
  description: optionalStringSchema,
});

const viewsCardSchema = siteCardBaseSchema.extend({
  type: z.literal('views'),
});

const siteCardSchema = z.discriminatedUnion('type', [
  linkCardSchema,
  noteCardSchema,
  imageCardSchema,
  mapCardSchema,
  githubCardSchema,
  emailCollectCardSchema,
  countdownCardSchema,
  weatherCardSchema,
  twitterCardSchema,
  musicCardSchema,
  podcastsCardSchema,
  youtubeChannelsCardSchema,
  booksCardSchema,
  favoritesCardSchema,
  calendarCardSchema,
  viewsCardSchema,
]);

const siteCardsSchema = z
  .array(siteCardSchema)
  .superRefine((cards, context) => {
    const seen = new Map<string, number>();

    for (const [index, card] of cards.entries()) {
      const previousIndex = seen.get(card.id);
      if (previousIndex !== undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate card id. First used at card ${previousIndex + 1}.`,
          path: [index, 'id'],
        });
        continue;
      }

      seen.set(card.id, index);
    }
  });

function getValidationMessage(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) {
    return 'Cards JSON is invalid.';
  }

  const path = issue.path.length > 0 ? issue.path.join('.') : 'cards';
  return `${path}: ${issue.message}`;
}

function isMissingSiteContentTable(error: unknown) {
  return (
    error instanceof Error && MISSING_SITE_CONTENT_TABLE_RE.test(error.message)
  );
}

export function stringifySiteCards(cards: SiteCard[]) {
  return JSON.stringify(cards, null, 2);
}

export function parseSiteCards(value: unknown) {
  const result = siteCardsSchema.safeParse(value);
  if (!result.success) {
    throw new Error(getValidationMessage(result.error));
  }

  return result.data as SiteCard[];
}

export function parseSiteCardsJson(value: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('Cards must be valid JSON.');
  }

  return parseSiteCards(parsed);
}

export async function getSiteCards() {
  try {
    const row = await db.query.siteContent.findFirst({
      where: (content, { eq }) => eq(content.key, SITE_CARDS_KEY),
    });

    if (!row) {
      return siteConfig.cards;
    }

    const result = siteCardsSchema.safeParse(row.value);
    return result.success ? (result.data as SiteCard[]) : siteConfig.cards;
  } catch (error) {
    if (isMissingSiteContentTable(error)) {
      return siteConfig.cards;
    }

    return siteConfig.cards;
  }
}

export async function getSiteCardsJson() {
  const cards = await getSiteCards();
  return stringifySiteCards(cards);
}

export async function saveSiteCards(cards: SiteCard[]) {
  try {
    await db
      .insert(siteContent)
      .values({
        key: SITE_CARDS_KEY,
        value: cards,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: {
          value: cards,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    if (isMissingSiteContentTable(error)) {
      throw new Error(
        'The site content table is missing. Run bun run db:push and try again.'
      );
    }

    throw error;
  }
}

export async function resetSiteCards() {
  try {
    await db.delete(siteContent).where(eq(siteContent.key, SITE_CARDS_KEY));
  } catch (error) {
    if (isMissingSiteContentTable(error)) {
      throw new Error(
        'The site content table is missing. Run bun run db:push and try again.'
      );
    }

    throw error;
  }
}
