import { adminSessionCookie } from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: adminSessionCookie.name,
    path: '/',
  });
  return NextResponse.redirect(new URL('/admin', request.url), {
    status: 303,
  });
}
