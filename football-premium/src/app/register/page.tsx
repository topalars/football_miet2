import PageShell from '@/components/PageShell';
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata = { title: 'Регистрация · PITCH' };

export default function RegisterPage() {
  return (
    <PageShell
      eyebrow="01 · Аккаунт"
      title="Регистрация."
      description="Создайте аккаунт, чтобы оставлять комментарии, сохранять матчи и получать персональную ленту обзоров."
    >
      <RegisterForm />
    </PageShell>
  );
}
