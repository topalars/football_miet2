'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

const JabulaniBall = dynamic(() => import('./JabulaniBall'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-white/20 text-sm tracking-widest">
      ЗАГРУЗКА СЦЕНЫ…
    </div>
  ),
});

const HEADLINE = ['Больше,', 'чем', 'игра'];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const ballOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[100svh] w-full overflow-hidden grain"
      aria-label="Главный экран"
    >
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 35%, rgba(57,255,106,0.10) 0%, rgba(11,11,11,0) 60%), radial-gradient(45% 40% at 80% 80%, rgba(95,160,255,0.06) 0%, rgba(11,11,11,0) 70%)',
        }}
      />

      <motion.div
        style={{ opacity: ballOpacity }}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden
      >
        <JabulaniBall />
      </motion.div>

      <motion.div
        style={{ y: textY }}
        className="container-pad mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center pt-40 md:pt-48 pb-32"
      >
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[11px] tracking-[0.4em] text-white/50 uppercase mb-6"
        >
          Премьер · Лига Чемпионов · Весь мир
        </motion.span>

        <h1 className="h-display text-balance text-[clamp(48px,9vw,144px)] font-semibold leading-[0.92]">
          {HEADLINE.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.35 + i * 0.09, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-[0.25em] last:mr-0"
            >
              {word === 'чем' ? <span className="italic font-light text-accent">{word}</span> : word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-balance text-white/55 text-[15px] md:text-base leading-relaxed"
        >
          Каждый матч. Каждый трансфер. Каждый момент, который имеет значение —
          в кинематографичных деталях и до финального свистка.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#highlights"
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-ink-900 text-sm font-medium hover:bg-accent transition-colors"
          >
            Смотреть обзоры
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-white/80 text-sm hover:border-white/40 hover:text-white transition-colors"
          >
            Регистрация
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute left-6 bottom-6 md:left-12 md:bottom-10 text-[10px] tracking-[0.3em] uppercase text-white/35 z-10"
      >
        прокрутка ↓
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute right-6 bottom-6 md:right-12 md:bottom-10 text-[10px] tracking-[0.3em] uppercase text-white/35 z-10"
      >
        v1.0 · 2026
      </motion.div>
    </section>
  );
}
