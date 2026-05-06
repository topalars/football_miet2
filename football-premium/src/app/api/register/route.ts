import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser } from '@/lib/storage';

export const runtime = 'nodejs';

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const NAME_RE = /^[А-ЯA-ZЁ][а-яa-zё]{1,49}$/;
const PHONE_RE = /^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC = 'Регистрация невозможна. Проверьте данные.';

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Неверный формат данных' }, { status: 400 });
  }

  const username = String(body.username ?? '').trim();
  const password = String(body.password ?? '');
  const firstname = String(body.firstname ?? '').trim();
  const lastname = String(body.lastname ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ success: false, message: GENERIC }, { status: 400 });
  }
  if (password.length < 6 || password.length > 128) {
    return NextResponse.json({ success: false, message: GENERIC }, { status: 400 });
  }
  if (!NAME_RE.test(firstname) || !NAME_RE.test(lastname)) {
    return NextResponse.json({ success: false, message: GENERIC }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, message: GENERIC }, { status: 400 });
  }
  if (phone && !PHONE_RE.test(phone)) {
    return NextResponse.json({ success: false, message: GENERIC }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await createUser({
      username,
      passwordHash,
      firstname,
      lastname,
      email: email || null,
      phone: phone || null,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'username_taken') {
      return NextResponse.json({ success: false, message: GENERIC }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: `Регистрация прошла успешно! Добро пожаловать, ${firstname}!`,
  });
}
