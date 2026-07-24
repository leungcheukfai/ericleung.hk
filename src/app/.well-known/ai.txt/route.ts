import { siteConfig } from '@/content/site';
import { getSiteOrigin } from '@/lib/site-url';

export function GET() {
  const origin = getSiteOrigin();
  return new Response(
    `site: ${siteConfig.title}\ndescription: ${siteConfig.description}\ncanonical: ${origin}/\nllms: ${origin}/llms.txt\nsummary: ${origin}/ai/summary.json\nfaq: ${origin}/ai/faq.json\nservice: ${origin}/ai/service.json\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}
