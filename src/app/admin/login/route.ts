import { adminSessionCookie, createAdminSessionToken, isValidAdminPassword } from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');

  if (!isValidAdminPassword(password)) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url), {
      status: 303,
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie.name, createAdminSessionToken(), {
    httpOnly: true,
    maxAge: adminSessionCookie.maxAge,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return NextResponse.redirect(new URL('/admin', request.url), {
    status: 303,
  });
}
