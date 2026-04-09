import { getRequestMeta } from '@/server/request-meta';
import { recordSiteClick } from '@/server/site-analytics';
import { z } from 'zod';

const ClickSchema = z.object({
  cardId: z.string().min(1),
  href: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = ClickSchema.parse(await request.json());
    await recordSiteClick(payload, getRequestMeta(request.headers));
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid click payload.' }, { status: 400 });
    }

    return Response.json({ error: 'Could not record click.' }, { status: 500 });
  }
}
