# PITCH — премиум-футбольный сайт (отдельный проект)

Премиум-фронтенд на Next.js + 3D-сцена. Использует существующие Flask-микросервисы (`comments_service`, `notification_service`) из старого проекта **без изменений**. Старый Django-проект не трогается.

## Стек

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS 3
- React Three Fiber + drei + three (Jabulani-стиль 3D-мяч)
- Framer Motion (scroll/hover-анимации)
- bcryptjs (хеш паролей при регистрации)
- HMAC-cookie сессия для админки

## Возможности

| Раздел | URL | Что делает |
|---|---|---|
| Главная | `/` | Hero с 3D-мячом, секции features/stats/showreel |
| Регистрация | `/register` | Форма + сохранение в `data/users.json` (пароль bcrypt) |
| Обратная связь | `/feedback` | Прокси на `notification:8002` → пересылается в Telegram |
| Комментарии | `/comments` | Прокси на `comments:8001` (GET/POST), live-обновление |
| Админка | `/admin` | Список пользователей, комментариев, обратной связи |
| Вход в админку | `/admin/login` | Пароль из `ADMIN_PASSWORD` (env), HMAC-cookie на 8 часов |

## Структура

```
football-premium/
├── public/{images,videos}/           # ассеты, перенесённые из Django
├── data/                             # сюда пишется users.json (volume в Docker)
├── src/
│   ├── app/
│   │   ├── page.tsx                  # лендинг (Hero, Features, Stats, Showreel)
│   │   ├── register/page.tsx
│   │   ├── feedback/page.tsx
│   │   ├── comments/page.tsx
│   │   ├── admin/page.tsx            # server component, защищён cookie
│   │   ├── admin/login/page.tsx
│   │   └── api/
│   │       ├── register/route.ts
│   │       ├── feedback/route.ts     # → notification:8002
│   │       ├── comments/route.ts     # → comments:8001 (GET+POST)
│   │       └── admin/{login,logout}/route.ts
│   ├── components/
│   │   ├── Header.tsx, Hero.tsx, JabulaniBall.tsx
│   │   ├── Features.tsx, Stats.tsx, Showreel.tsx
│   │   ├── PageShell.tsx
│   │   └── forms/{Field,RegisterForm,FeedbackForm,CommentsBoard}.tsx
│   └── lib/
│       ├── storage.ts                # JSON-хранилище пользователей
│       ├── auth.ts                   # HMAC-cookie для админа
│       └── services.ts               # URL Flask-сервисов
├── Dockerfile
├── docker-compose.yml                # frontend + comments + notification
└── .env.example
```

## Локальный запуск (без Docker)

```bash
cd football-premium
cp .env.example .env.local            # вписать TELEGRAM_BOT_TOKEN/CHAT_ID при необходимости
npm install
npm run dev
```

→ http://localhost:3000

> Если используешь обратную связь / комментарии — параллельно подними Flask-сервисы из старого проекта,
> либо просто прогоняй всё через docker-compose (см. ниже).

## Запуск всей системы через Docker (рекомендуется)

```bash
cd football-premium
cp .env.example .env
# впиши свои TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, ADMIN_PASSWORD
docker compose up --build
```

Поднимает:
- `frontend` (Next.js) → http://localhost:3000
- `comments` (Flask) — внутренний `:8001`
- `notification` (Flask) — внутренний `:8002`, шлёт в Telegram

Старый Django (`web_service`) при этом не запускается. Для него остался отдельный `docker-compose.yml` в корне проекта — он не пересекается с новым.

## Переменные окружения

| Переменная | Что | По умолчанию |
|---|---|---|
| `ADMIN_PASSWORD` | пароль для `/admin/login` | `admin` |
| `ADMIN_SECRET` | секрет HMAC для cookie-сессии админа | `change-me-in-prod` |
| `TELEGRAM_BOT_TOKEN` | токен бота (использует notification-сервис) | пусто |
| `TELEGRAM_CHAT_ID` | id чата для уведомлений | пусто |
| `COMMENTS_SERVICE_URL` | где живёт comments-сервис | `http://comments:8001` |
| `NOTIFICATIONS_SERVICE_URL` | где живёт notification-сервис | `http://notification:8002` |
| `DATA_DIR` | папка для users.json | `./data` |

## Архитектура

```
            ┌─────────────────────────────┐
браузер ───▶│ Next.js (frontend, :3000)   │
            │ ─ страницы + API routes     │
            │ ─ JSON-хранилище /app/data  │
            │ ─ admin cookie (HMAC)       │
            └──┬───────────────────┬──────┘
               │                   │
               ▼                   ▼
       ┌──────────────┐    ┌─────────────────┐
       │ comments     │    │ notification    │
       │ (Flask:8001) │    │ (Flask:8002)    │
       │ SQLite       │    │ SQLite + TG bot │
       └──────────────┘    └─────────────────┘
```

## Что сделано из ТЗ

- 3D-мяч (PBR, Jabulani-паттерн, mouse-парallax, Float, env-reflection)
- Минималистичный glass header (z-50, backdrop-blur, фон не теряется на скролле)
- Полностью русская локализация (lang="ru", метаданные, тексты, числа в `ru-RU`)
- Параллакс/scroll-анимации (Framer Motion: `useScroll`, `useTransform`, `whileInView`)
- Reuse Flask-сервисов и TG-бота из старого проекта
- Регистрация/комментарии/обратная связь повторяют логику и валидаторы Django-аналога
- Админка с HTTP-only cookie + HMAC-подпись
- Docker (multi-stage standalone) + docker-compose (3 сервиса + 3 volumes)
- Footer удалён по требованию

## Известные ограничения

- На путях с кириллицей (`Рабочий стол`) `npm install` иногда падает на Windows. Если так — перенеси папку в латинский путь или собирай через Docker.
- В `data/users.json` хранится bcrypt-хеш пароля. Логин-форма не реализована (в старом проекте её тоже не было — только регистрация и админка).
- Comments/notifications: их БД (SQLite) живёт внутри Flask-контейнеров (volume). При первом запуске пусто — это нормально.
