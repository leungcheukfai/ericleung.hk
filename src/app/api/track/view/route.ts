import { getRequestMeta } from '@/server/request-meta';
import { recordSiteView } from '@/server/site-analytics';

export async function POST(request: Request) {
  try {
    await recordSiteView(getRequestMeta(request.headers));
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: 'Could not record view.' }, { status: 500 });
  }
}
