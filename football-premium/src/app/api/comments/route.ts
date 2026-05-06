import { NextResponse } from 'next/server';
import { COMMENTS_URL } from '@/lib/services';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await fetch(`${COMMENTS_URL}/comments`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'Ошибка получения комментариев' },
        { status: 502 },
      );
    }
    const data = await res.json();
    return NextResponse.json({ success: true, comments: data.comments ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Сервис комментариев недоступен' },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Неверный формат данных' }, { status: 400 });
  }

  const username = String(body.username ?? '').trim().slice(0, 50);
  const text = String(body.text ?? '').trim().slice(0, 500);

  if (!username || !text) {
    return NextResponse.json({ success: false, message: 'Заполните все поля' }, { status: 400 });
  }

  try {
    const res = await fetch(`${COMMENTS_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Комментарий добавлен' });
    }
    return NextResponse.json(
      { success: false, message: 'Не удалось добавить комментарий' },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Сервис комментариев недоступен' },
      { status: 503 },
    );
  }
}
