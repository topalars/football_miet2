'use client';

import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

const STATS = [
  { value: 142, suffix: '+', label: 'Лиг в покрытии', sub: 'На 6 континентах' },
  { value: 2400, suffix: '/нед', label: 'Live-матчей', sub: 'Индексируем в реальном времени' },
  { value: 98, suffix: '%', label: 'Точность обзоров', sub: 'Через секунды после свистка' },
  { value: 36, suffix: 'M', label: 'Активных болельщиков', sub: 'В 84 странах' },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString('ru-RU'));

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
      return () => controls.stop();
    }
  }, [inView, mv, to]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{display}</motion.span>
      <span className="text-accent">{suffix}</span>
    </span>
  );
}

export default function Stats() {
  return (
    <section id="matches" className="relative border-y border-white/5 py-28 md:py-36 overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(57,255,106,0.05) 0%, rgba(11,11,11,0) 70%)',
        }}
      />
      <div className="container-pad mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 max-w-2xl"
        >
          <span className="text-[11px] tracking-[0.4em] uppercase text-accent/80">03 · Масштаб</span>
          <h2 className="h-display mt-3 text-[clamp(32px,5vw,64px)] font-semibold text-balance">
            Одна платформа. <span className="italic font-light text-white/60">Каждый</span> стадион.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-white/10 pt-6"
            >
              <div className="h-display text-[clamp(40px,5vw,72px)] font-semibold text-white tabular-nums">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-3 text-[13px] tracking-wide text-white/80">{s.label}</div>
              <div className="text-[12px] text-white/40 mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
