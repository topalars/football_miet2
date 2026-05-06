'use client';

import { motion } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { Field, TextArea } from './Field';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok'; message: string } | { kind: 'err'; message: string };

export default function FeedbackForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'sending' });
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState({ kind: 'ok', message: 'Сообщение отправлено. Мы получим его в Telegram.' });
        (e.target as HTMLFormElement).reset();
      } else {
        setState({ kind: 'err', message: data.message ?? 'Не удалось отправить сообщение' });
      }
    } catch {
      setState({ kind: 'err', message: 'Сервис уведомлений недоступен' });
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 max-w-3xl"
      noValidate
    >
      <Field name="name" label="Имя" placeholder="Как к вам обращаться?" required maxLength={100} />
      <Field name="email" type="email" label="Email" placeholder="you@mail.ru" required maxLength={254} />
      <div className="md:col-span-2">
        <TextArea name="message" label="Сообщение" placeholder="Что хотите сказать?" required maxLength={2000} />
      </div>

      <div className="md:col-span-2 flex items-center justify-between gap-4 pt-4 border-t border-white/5">
        <p className="text-[12px] text-white/40 max-w-md">
          Сообщение мгновенно уходит администраторам в Telegram и сохраняется в системе.
        </p>
        <button
          type="submit"
          disabled={state.kind === 'sending'}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink-900 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {state.kind === 'sending' ? 'Отправка…' : 'Отправить →'}
        </button>
      </div>

      {state.kind === 'ok' && (
        <div className="md:col-span-2 px-4 py-3 rounded-xl border border-accent/30 bg-accent/5 text-accent text-sm">
          {state.message}
        </div>
      )}
      {state.kind === 'err' && (
        <div className="md:col-span-2 px-4 py-3 rounded-xl border border-red-400/30 bg-red-400/5 text-red-300 text-sm">
          {state.message}
        </div>
      )}
    </motion.form>
  );
}
