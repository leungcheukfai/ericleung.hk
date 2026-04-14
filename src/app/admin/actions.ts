'use server';

import { type SiteCard, siteConfig } from '@/content/site';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  parseSiteCards,
  resetSiteCards,
  saveSiteCards,
} from '@/server/site-content';
import { revalidatePath } from 'next/cache';

export type AdminCardsActionResult = {
  cards?: SiteCard[];
  message: string;
  ok: boolean;
};

export async function saveAdminCardsAction(
  cards: SiteCard[]
): Promise<AdminCardsActionResult> {
  if (!(await isAdminAuthenticated())) {
    return {
      ok: false,
      message: 'Your admin session expired. Refresh and sign in again.',
    };
  }

  try {
    const validatedCards = parseSiteCards(cards);
    await saveSiteCards(validatedCards);
    revalidatePath('/');
    revalidatePath('/admin');

    return {
      ok: true,
      cards: validatedCards,
      message: 'Cards saved and homepage cache refreshed.',
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save cards right now.',
    };
  }
}

export async function resetAdminCardsAction(): Promise<AdminCardsActionResult> {
  if (!(await isAdminAuthenticated())) {
    return {
      ok: false,
      message: 'Your admin session expired. Refresh and sign in again.',
    };
  }

  try {
    await resetSiteCards();
    revalidatePath('/');
    revalidatePath('/admin');

    return {
      ok: true,
      cards: siteConfig.cards,
      message: 'Cards reset to the defaults from src/content/site.ts.',
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to reset cards right now.',
    };
  }
}
