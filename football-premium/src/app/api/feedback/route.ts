import { NextResponse } from 'next/server';
import { NOTIFICATIONS_URL } from '@/lib/services';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Неверный формат данных' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim().slice(0, 100);
  const email = String(body.email ?? '').trim().slice(0, 254);
  const message = String(body.message ?? '').trim().slice(0, 2000);

  if (!name || !email || !message) {
    return NextResponse.json({ success: false, message: 'Заполните все поля' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, message: 'Некорректный email' }, { status: 400 });
  }

  try {
    const res = await fetch(`${NOTIFICATIONS_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Сообщение отправлено' });
    }
    return NextResponse.json(
      { success: false, message: 'Не удалось сохранить сообщение' },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Сервис уведомлений недоступен' },
      { status: 503 },
    );
  }
}
