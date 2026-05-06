'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Showreel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 1.04]);
  const radius = useTransform(scrollYProgress, [0, 0.5], ['28px', '8px']);

  return (
    <section id="transfers" className="relative container-pad mx-auto max-w-7xl py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 flex items-end justify-between gap-6"
      >
        <div>
          <span className="text-[11px] tracking-[0.4em] uppercase text-accent/80">04 · Showreel</span>
          <h2 className="h-display mt-3 text-[clamp(28px,4.5vw,56px)] font-semibold max-w-xl text-balance">
            Матч в движении.
          </h2>
        </div>
        <span className="hidden md:inline text-[12px] tracking-[0.3em] uppercase text-white/40">
          Авто-плей · без звука
        </span>
      </motion.div>

      <motion.div
        ref={ref}
        style={{ scale, borderRadius: radius }}
        className="relative overflow-hidden border border-white/10 aspect-video bg-ink-800"
      >
        <video
          src="/videos/match.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/match.jpg"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-white/80">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          В эфире · Лига Чемпионов · 89’
        </div>
      </motion.div>
    </section>
  );
}
