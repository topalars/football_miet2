import Header from '@/components/Header';

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function PageShell({ eyebrow, title, description, children }: Props) {
  return (
    <main className="relative min-h-screen pb-32">
      <Header />
      <div
        className="absolute inset-x-0 top-0 h-[80vh] -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(57,255,106,0.08) 0%, rgba(11,11,11,0) 60%)',
        }}
      />
      <section className="container-pad mx-auto max-w-5xl pt-36 md:pt-44">
        {eyebrow && (
          <span className="text-[11px] tracking-[0.4em] uppercase text-accent/80">
            {eyebrow}
          </span>
        )}
        <h1 className="h-display mt-3 text-[clamp(40px,7vw,96px)] font-semibold leading-[0.95] text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-xl text-white/55 text-base leading-relaxed">
            {description}
          </p>
        )}
        <div className="mt-16">{children}</div>
      </section>
    </main>
  );
}
