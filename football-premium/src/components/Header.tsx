'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { label: 'Матчи', href: '/#matches' },
  { label: 'Обзоры', href: '/#highlights' },
  { label: 'Комментарии', href: '/comments' },
  { label: 'Обратная связь', href: '/feedback' },
];

export default function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);
  });

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-[100] transition-[height,background,border] duration-500 ${
        scrolled
          ? 'h-14 bg-ink-900/80 border-b border-white/5 backdrop-blur-xl'
          : 'h-20 bg-ink-900/30 border-b border-transparent backdrop-blur-md'
      }`}
    >
      <div className="container-pad mx-auto h-full max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_18px_rgba(57,255,106,0.55)]" />
          <span className="font-semibold tracking-[0.18em] text-sm text-white/90 group-hover:text-white transition-colors">
            PITCH
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13px] tracking-wide text-white/65 hover:text-white transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/register"
          className="hidden sm:inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-white/10 hover:border-accent hover:text-accent transition-colors"
        >
          Войти
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
    </motion.header>
  );
}
