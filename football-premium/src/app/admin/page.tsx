import Header from '@/components/Header';
import { isAdminAuthed } from '@/lib/auth';
import { listUsers } from '@/lib/storage';
import { COMMENTS_URL, NOTIFICATIONS_URL } from '@/lib/services';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import DeleteCommentButton from './DeleteCommentButton';

export const metadata = { title: 'Админка · PITCH' };
export const dynamic = 'force-dynamic';

type Comment = { id: number; username: string; text: string; created_at: string };
type Notification = {
  id: number;
  name: string;
  email: string;
  message: string;
  sent_to_telegram: number;
  created_at: string;
};

async function fetchComments(): Promise<Comment[]> {
  try {
    const res = await fetch(`${COMMENTS_URL}/comments`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments ?? [];
  } catch {
    return [];
  }
}

async function fetchNotifications(): Promise<Notification[]> {
  try {
    const res = await fetch(`${NOTIFICATIONS_URL}/notifications`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.notifications ?? [];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  if (!(await isAdminAuthed())) redirect('/admin/login');

  const [users, comments, notifications] = await Promise.all([
    listUsers(),
    fetchComments(),
    fetchNotifications(),
  ]);

  return (
    <main className="relative min-h-screen pb-32">
      <Header />
      <section className="container-pad mx-auto max-w-7xl pt-36 md:pt-44">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[11px] tracking-[0.4em] uppercase text-accent/80">Панель</span>
            <h1 className="h-display mt-3 text-[clamp(36px,6vw,80px)] font-semibold leading-[0.95]">
              Админка.
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <Stat label="Пользователей" value={users.length} />
          <Stat label="Комментариев" value={comments.length} />
          <Stat label="Сообщений" value={notifications.length} />
        </div>

        <Section title={`Пользователи · ${users.length}`}>
          {users.length === 0 ? (
            <Empty>Никто ещё не зарегистрировался</Empty>
          ) : (
            <Table head={['Логин', 'Имя', 'Email', 'Телефон', 'Дата']}>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="py-3 text-accent">{u.username}</td>
                  <td className="py-3 text-white/85">
                    {u.firstname} {u.lastname}
                  </td>
                  <td className="py-3 text-white/55">{u.email ?? '—'}</td>
                  <td className="py-3 text-white/55">{u.phone ?? '—'}</td>
                  <td className="py-3 text-white/40 text-[12px]">
                    {new Date(u.createdAt).toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Section>

        <Section title={`Комментарии · ${comments.length}`}>
          {comments.length === 0 ? (
            <Empty>Сервис комментариев пуст или недоступен</Empty>
          ) : (
            <Table head={['#', 'Имя', 'Текст', 'Дата', '']}>
              {comments.map((c) => (
                <tr key={c.id} className="border-t border-white/5 align-top">
                  <td className="py-3 text-white/35">{c.id}</td>
                  <td className="py-3 text-accent whitespace-nowrap pr-4">{c.username}</td>
                  <td className="py-3 text-white/85">{c.text}</td>
                  <td className="py-3 text-white/40 text-[12px] whitespace-nowrap">{c.created_at}</td>
                  <td className="py-3 whitespace-nowrap">
                    <DeleteCommentButton id={c.id} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Section>

        <Section title={`Обратная связь · ${notifications.length}`}>
          {notifications.length === 0 ? (
            <Empty>Сообщений нет или сервис недоступен</Empty>
          ) : (
            <Table head={['#', 'Имя', 'Email', 'Сообщение', 'Telegram', 'Дата']}>
              {notifications.map((n) => (
                <tr key={n.id} className="border-t border-white/5 align-top">
                  <td className="py-3 text-white/35">{n.id}</td>
                  <td className="py-3 text-accent whitespace-nowrap pr-4">{n.name}</td>
                  <td className="py-3 text-white/55 whitespace-nowrap pr-4">{n.email}</td>
                  <td className="py-3 text-white/85">{n.message}</td>
                  <td className="py-3 text-[12px] whitespace-nowrap">
                    {n.sent_to_telegram ? (
                      <span className="text-accent">отправлено</span>
                    ) : (
                      <span className="text-white/40">в очереди</span>
                    )}
                  </td>
                  <td className="py-3 text-white/40 text-[12px] whitespace-nowrap">{n.created_at}</td>
                </tr>
              ))}
            </Table>
          )}
        </Section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="h-display text-[clamp(36px,4vw,56px)] font-semibold tabular-nums">{value}</div>
      <div className="mt-2 text-[12px] tracking-[0.25em] uppercase text-white/45">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-[11px] tracking-[0.3em] uppercase text-white/55 mb-4">{title}</h2>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left">
          {head.map((h) => (
            <th key={h} className="pb-3 text-[11px] tracking-[0.2em] uppercase text-white/35 font-normal">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-white/40 text-sm py-8">{children}</div>;
}
