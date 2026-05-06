import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { COMMENTS_URL } from '@/lib/services';

export const runtime = 'nodejs';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ success: false, message: 'Не авторизован' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ success: false, message: 'Неверный id' }, { status: 400 });
  }

  try {
    const res = await fetch(`${COMMENTS_URL}/comments/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (res.ok) return NextResponse.json({ success: true });
    return NextResponse.json({ success: false, message: data.message }, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Сервис комментариев недоступен' },
      { status: 503 },
    );
  }
}
