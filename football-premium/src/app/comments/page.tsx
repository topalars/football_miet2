import PageShell from '@/components/PageShell';
import CommentsBoard from '@/components/forms/CommentsBoard';

export const metadata = { title: 'Комментарии · PITCH' };

export default function CommentsPage() {
  return (
    <PageShell
      eyebrow="03 · Сообщество"
      title="Комментарии."
      description="Что говорят болельщики прямо сейчас. Лента обновляется автоматически."
    >
      <CommentsBoard />
    </PageShell>
  );
}
