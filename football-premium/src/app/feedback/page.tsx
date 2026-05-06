import PageShell from '@/components/PageShell';
import FeedbackForm from '@/components/forms/FeedbackForm';

export const metadata = { title: 'Обратная связь · PITCH' };

export default function FeedbackPage() {
  return (
    <PageShell
      eyebrow="02 · Связь"
      title="Обратная связь."
      description="Расскажите, что вам нравится, что — нет, и чего не хватает. Сообщения мгновенно уходят в наш Telegram."
    >
      <FeedbackForm />
    </PageShell>
  );
}
