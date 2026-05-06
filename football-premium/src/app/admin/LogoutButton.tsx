'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-[12px] tracking-[0.2em] uppercase text-white/70 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
    >
      {busy ? 'Выход…' : 'Выйти →'}
    </button>
  );
}
