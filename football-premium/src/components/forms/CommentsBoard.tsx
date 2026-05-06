'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Field, TextArea } from './Field';

type Comment = { id: number; username: string; text: string; created_at: string };

export default function CommentsBoard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/comments', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setComments(data.comments ?? []);
      else setErr(data.message ?? 'Ошибка загрузки');
    } catch {
      setErr('Сервис комментариев недоступен');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        load();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="lg:col-span-5 lg:sticky lg:top-32 self-start grid grid-cols-1 gap-6"
        noValidate
      >
        <Field name="username" label="Имя" placeholder="Аноним" required maxLength={50} />
        <TextArea name="text" label="Комментарий" placeholder="Что вы думаете о матче?" required maxLength={500} />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink-900 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {sending ? 'Отправка…' : 'Опубликовать →'}
        </button>
      </motion.form>

      <div className="lg:col-span-7 space-y-3">
        {loading && comments.length === 0 && (
          <div className="text-white/40 text-sm">Загрузка…</div>
        )}
        {err && comments.length === 0 && (
          <div className="px-4 py-3 rounded-xl border border-red-400/30 bg-red-400/5 text-red-300 text-sm">{err}</div>
        )}
        {!loading && comments.length === 0 && !err && (
          <div className="text-white/40 text-sm">Пока нет комментариев. Будьте первым.</div>
        )}

        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-xl p-5"
            >
              <header className="flex items-baseline justify-between gap-3 mb-2">
                <span className="text-accent text-sm font-medium">{c.username}</span>
                <span className="text-[11px] text-white/35">{c.created_at}</span>
              </header>
              <p className="text-white/80 text-[15px] leading-relaxed whitespace-pre-wrap">{c.text}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
