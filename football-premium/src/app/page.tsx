import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Showreel from '@/components/Showreel';
import Stats from '@/components/Stats';

export default function HomePage() {
  return (
    <main className="relative pb-32">
      <Header />
      <Hero />
      <Features />
      <Stats />
      <Showreel />
    </main>
  );
}
