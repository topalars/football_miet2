import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, checkPassword, createSessionToken } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Неверный формат данных' }, { status: 400 });
  }

  const password = String(body.password ?? '');
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ success: false, message: 'Неверный пароль' }, { status: 401 });
  }

  const token = createSessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
