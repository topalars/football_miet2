'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteCommentButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm('Удалить комментарий?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message ?? 'Ошибка удаления');
      }
    } catch {
      alert('Сервис недоступен');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-[11px] tracking-[0.2em] uppercase text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
    >
      {busy ? '…' : 'Удалить'}
    </button>
  );
}
