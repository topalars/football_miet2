import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PITCH — Больше, чем игра',
  description:
    'Премиум-футбол: live-счёт, трансферы и кинематографичные обзоры главных лиг мира.',
  keywords: ['футбол', 'премьер-лига', 'лига чемпионов', 'обзоры', 'трансферы'],
  authors: [{ name: 'PITCH' }],
  openGraph: {
    title: 'PITCH — Больше, чем игра',
    description: 'Премиум-футбол: live-счёт, трансферы и кинематографичные обзоры.',
    type: 'website',
    locale: 'ru_RU',
  },
  themeColor: '#0B0B0B',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-display antialiased bg-ink-900 text-white">
        {children}
      </body>
    </html>
  );
}
