'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Field } from '@/components/forms/Field';

export default function LoginForm() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: fd.get('password') }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.replace('/admin');
        router.refresh();
      } else {
        setErr(data.message ?? 'Ошибка входа');
      }
    } catch {
      setErr('Сервис недоступен');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid grid-cols-1 gap-6">
      <Field name="password" type="password" label="Пароль" placeholder="••••••••" required autoFocus />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink-900 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
      >
        {busy ? 'Проверка…' : 'Войти →'}
      </button>
      {err && (
        <div className="px-4 py-3 rounded-xl border border-red-400/30 bg-red-400/5 text-red-300 text-sm">{err}</div>
      )}
    </form>
  );
}
