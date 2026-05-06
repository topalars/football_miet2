'use client';

import { motion } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { Field } from './Field';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok'; message: string } | { kind: 'err'; message: string };

export default function RegisterForm() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'sending' });
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState({ kind: 'ok', message: data.message ?? 'Регистрация прошла успешно' });
        (e.target as HTMLFormElement).reset();
      } else {
        setState({ kind: 'err', message: data.message ?? 'Не удалось зарегистрироваться' });
      }
    } catch {
      setState({ kind: 'err', message: 'Сервис недоступен' });
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
      <Field name="firstname" label="Имя" placeholder="Иван" required minLength={2} maxLength={50} pattern="^[А-ЯA-ZЁ][а-яa-zё]{1,49}$" hint="С заглавной буквы" />
      <Field name="lastname" label="Фамилия" placeholder="Иванов" required minLength={2} maxLength={50} pattern="^[А-ЯA-ZЁ][а-яa-zё]{1,49}$" />
      <Field name="username" label="Логин" placeholder="ivan_2026" required minLength={3} maxLength={20} pattern="^[A-Za-z0-9_]{3,20}$" hint="3–20 символов, латиница" />
      <Field name="password" type="password" label="Пароль" placeholder="••••••••" required minLength={6} maxLength={128} hint="мин. 6 символов" />
      <Field name="email" type="email" label="Email" placeholder="ivan@mail.ru" />
      <Field name="phone" label="Телефон" placeholder="+7-999-123-45-67" pattern="^\+7-\d{3}-\d{3}-\d{2}-\d{2}$" hint="+7-XXX-XXX-XX-XX" />

      <div className="md:col-span-2 flex items-center justify-between gap-4 pt-4 border-t border-white/5">
        <p className="text-[12px] text-white/40 max-w-md">
          Нажимая «Зарегистрироваться», вы соглашаетесь с правилами использования и обработкой данных.
        </p>
        <button
          type="submit"
          disabled={state.kind === 'sending'}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-ink-900 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {state.kind === 'sending' ? 'Отправка…' : 'Зарегистрироваться →'}
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
