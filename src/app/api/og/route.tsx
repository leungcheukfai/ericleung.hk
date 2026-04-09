import { siteConfig } from '@/content/site';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const [calSans, inter] = await Promise.all([
    fetch(new URL('/fonts/CalSans-SemiBold.ttf', req.url)).then((res) =>
      res.arrayBuffer()
    ),
    fetch(new URL('/fonts/Inter-Regular.ttf', req.url)).then((res) =>
      res.arrayBuffer()
    ),
  ]);

  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') ?? siteConfig.title;
  const description =
    searchParams.get('description') ?? siteConfig.description;

  return new ImageResponse(
    <div
      tw="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#f6f7f4] text-[#111827]"
      style={{ padding: 56 }}
    >
      <div tw="absolute inset-0" style={{ background: 'radial-gradient(circle at top left, rgba(15,118,110,0.16), transparent 40%)' }} />
      <div tw="absolute inset-0" style={{ background: 'radial-gradient(circle at bottom right, rgba(30,64,175,0.14), transparent 35%)' }} />

      <div tw="relative flex flex-col">
        <p
          tw="mb-5 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xl"
          style={{ fontFamily: 'Inter' }}
        >
          ericleung.hk
        </p>
        <h1 style={{ fontFamily: 'Cal Sans' }} tw="max-w-[75vw] text-7xl leading-[1.05]">
          {title}
        </h1>
        <p tw="mt-6 max-w-[64vw] text-3xl text-black/60">
          {description.slice(0, 140).replace(/(<([^>]+)>)/gi, '')}
          {description.length > 140 ? '...' : ''}
        </p>
      </div>

      <div tw="relative flex items-end justify-between">
        <div tw="flex flex-col">
          <p style={{ fontFamily: 'Cal Sans' }} tw="text-3xl">
            {siteConfig.profile.name}
          </p>
          <p tw="mt-2 text-xl text-black/55">{siteConfig.profile.role}</p>
        </div>
        <div tw="rounded-[24px] border border-black/10 bg-white/70 px-5 py-4">
          <p tw="text-xl text-black/55">Config-driven bento homepage</p>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          data: calSans,
          name: 'Cal Sans',
          style: 'normal',
          weight: 600,
        },
        {
          data: inter,
          name: 'Inter',
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}
