import {
  BeehiivConfigError,
  BeehiivRequestError,
  subscribeToBeehiiv,
} from '@/server/beehiiv';
import { addSiteSubscriber } from '@/server/site-analytics';
import { z } from 'zod';

const SubscribeSchema = z.object({
  email: z.string().trim().email(),
});

function getBeehiivErrorResponse(error: BeehiivRequestError) {
  if (error.status === 429) {
    return Response.json(
      {
        error:
          'Newsletter signup is busy right now. Please try again in a moment.',
      },
      { status: 429 }
    );
  }

  if (error.status === 400) {
    return Response.json(
      { error: 'That email could not be subscribed right now.' },
      { status: 400 }
    );
  }

  if (error.status === 401 || error.status === 403 || error.status === 404) {
    return Response.json(
      { error: 'Newsletter signup is not configured correctly yet.' },
      { status: 503 }
    );
  }

  return Response.json(
    { error: 'Could not subscribe right now.' },
    { status: 500 }
  );
}

export async function POST(request: Request) {
  try {
    const payload = SubscribeSchema.parse(await request.json());
    await subscribeToBeehiiv({
      email: payload.email,
      referringSite: request.headers.get('referer') ?? undefined,
    });
    await addSiteSubscriber(payload.email);

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (error instanceof BeehiivConfigError) {
      return Response.json(
        { error: 'Newsletter signup is not configured yet.' },
        { status: 503 }
      );
    }

    if (error instanceof BeehiivRequestError) {
      return getBeehiivErrorResponse(error);
    }

    return Response.json(
      { error: 'Could not subscribe right now.' },
      { status: 500 }
    );
  }
}
