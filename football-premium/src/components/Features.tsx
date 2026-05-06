'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

type Feature = {
  no: string;
  title: string;
  desc: string;
  asset: { type: 'image' | 'video'; src: string };
  tag: string;
};

const FEATURES: Feature[] = [
  {
    no: '01',
    title: 'Кинематографичные обзоры',
    desc: 'Каждый ключевой момент в 4K, slow-motion, с разных ракурсов. Смонтировано как фильм, доставлено как лента новостей.',
    asset: { type: 'image', src: '/images/match.jpg' },
    tag: 'Обзоры',
  },
  {
    no: '02',
    title: 'Пульс трансферов',
    desc: 'Real-time трекер сделок, инсайды от агентов и индекс достоверности слухов — до того, как выйдет официальный пресс-релиз.',
    asset: { type: 'image', src: '/images/transfer.jpg' },
    tag: 'Трансферы',
  },
  {
    no: '03',
    title: 'Расписание на завтра',
    desc: 'Календарь, заточенный под болельщика: время начала, трансляции, погода и кривая формы команд.',
    asset: { type: 'image', src: '/images/schedule.jpg' },
    tag: 'Календарь',
  },
];

export default function Features() {
  return (
    <section id="highlights" className="relative container-pad mx-auto max-w-7xl py-32 md:py-40">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20"
      >
        <div>
          <span className="text-[11px] tracking-[0.4em] uppercase text-accent/80">02 · Направления</span>
          <h2 className="h-display mt-3 text-[clamp(36px,5.5vw,72px)] font-semibold max-w-2xl text-balance">
            Для тех, кому важно <span className="italic font-light text-white/60">всё</span>.
          </h2>
        </div>
        <p className="max-w-md text-white/50 text-sm leading-relaxed">
          Три продукта. Один сигнал. Растворяются в твоём дне и поднимают только то, что действительно важно.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.no}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="group relative rounded-2xl overflow-hidden glass p-1"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink-800">
              <Image
                src={f.asset.src}
                alt={f.title}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
              <span className="absolute top-4 left-4 text-[10px] tracking-[0.3em] uppercase text-white/70 px-2 py-1 rounded-full border border-white/15 bg-black/30 backdrop-blur">
                {f.tag}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[11px] tracking-[0.3em] text-white/35">{f.no}</span>
                <span className="h-px w-16 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              <h3 className="text-xl font-medium leading-snug text-white">{f.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/55">{f.desc}</p>
              <a
                href="#"
                className="mt-6 inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-white/70 hover:text-accent transition-colors"
              >
                Подробнее
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
