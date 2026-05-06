import Header from '@/components/Header';
import LoginForm from './LoginForm';

export const metadata = { title: 'Админка · Вход' };

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen">
      <Header />
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(50% 40% at 50% 30%, rgba(57,255,106,0.06) 0%, rgba(11,11,11,0) 70%)',
        }}
      />
      <section className="container-pad mx-auto max-w-md pt-44">
        <span className="text-[11px] tracking-[0.4em] uppercase text-accent/80">Доступ</span>
        <h1 className="h-display mt-3 text-[clamp(36px,6vw,72px)] font-semibold leading-[0.95]">
          Админка.
        </h1>
        <p className="mt-4 text-white/55 text-sm">Введите пароль администратора.</p>
        <LoginForm />
      </section>
    </main>
  );
}
