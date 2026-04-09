import { getMusicMetadata } from '@/server/music-metadata';
import { z } from 'zod';

const QuerySchema = z.object({
  url: z.string().url(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { url } = QuerySchema.parse({
      url: searchParams.get('url'),
    });
    const metadata = await getMusicMetadata(url);

    if (!metadata) {
      return Response.json({ error: 'Unsupported music provider.' }, { status: 400 });
    }

    return Response.json(metadata);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid music URL.' }, { status: 400 });
    }

    return Response.json(
      { error: 'Could not load music metadata.' },
      { status: 500 }
    );
  }
}
