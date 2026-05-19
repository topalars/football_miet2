# Деплой на Railway

Пошаговая инструкция для развёртывания проекта (Django + микросервисы) на [Railway](https://railway.app).

## Архитектура на Railway

```
Railway Project (football_miet)
├── 🌐 web (Django)              ← публичный домен
├── 💬 comments (Flask)          ← внутренний
├── 🔔 notification (Flask)      ← внутренний
└── 🐘 PostgreSQL                ← база для Django
```

---

## Шаг 1. Регистрация

1. Зайдите на https://railway.app
2. Нажмите **Login** → **Login with GitHub**
3. Подтвердите доступ к репозиториям

> 💡 Бесплатный план: $5 кредитов каждый месяц. Этого хватает на учебные проекты.

---

## Шаг 2. Создание проекта

1. Нажмите **+ New Project**
2. Выберите **Deploy from GitHub repo**
3. Выберите репозиторий `topalars/football_miet2`
4. Railway покажет окно настроек. **Не нажимайте Deploy сразу!**

---

## Шаг 3. Настройка сервиса `web` (Django)

После добавления репо появится первый сервис. Откройте его и:

### 3.1. Settings → Source
- **Root Directory**: `web_service`
- **Watch Paths**: оставить пустым

### 3.2. Settings → Build
- **Builder**: `Dockerfile`
- **Dockerfile Path**: `Dockerfile` (по умолчанию)

### 3.3. Settings → Networking
- Нажмите **Generate Domain** → появится `web-production-xxxx.up.railway.app`

### 3.4. Variables (вкладка Variables)
Добавьте:

| Переменная | Значение |
|------------|----------|
| `DJANGO_SECRET_KEY` | случайная строка (см. ниже) |
| `DJANGO_DEBUG` | `0` |
| `DJANGO_ALLOWED_HOSTS` | `*.up.railway.app` |

**Как сгенерировать SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Шаг 4. Добавление PostgreSQL

1. В вашем проекте нажмите **+ New** → **Database** → **Add PostgreSQL**
2. Railway автоматически создаст переменную `DATABASE_URL`
3. Привяжите её к `web`:
   - Откройте сервис `web` → **Variables**
   - Нажмите **+ Variable Reference** → выберите `Postgres.DATABASE_URL`

---

## Шаг 5. Сервис `comments`

1. В проекте: **+ New** → **GitHub Repo** → тот же репо
2. Settings → Source → **Root Directory**: `comments_service`
3. Settings → Build → **Builder**: `Dockerfile`
4. **НЕ генерируйте публичный домен** (внутренний сервис)
5. Variables:
   - `CORS_ORIGINS` = `https://web-production-xxxx.up.railway.app` (домен Django)
   - `FLASK_DEBUG` = `0`

---

## Шаг 6. Сервис `notification`

1. **+ New** → **GitHub Repo** → тот же репо
2. Root Directory: `notification_service`
3. Builder: `Dockerfile`
4. Variables:
   - `CORS_ORIGINS` = домен Django
   - `FLASK_DEBUG` = `0`
   - `TELEGRAM_BOT_TOKEN` = ваш токен от @BotFather
   - `TELEGRAM_CHAT_ID` = ID чата

---

## Шаг 7. Связывание сервисов (внутренние URL)

Railway даёт каждому сервису внутренний хост: `<service-name>.railway.internal`.

Откройте сервис `web` → **Variables** → добавьте:

| Переменная | Значение |
|------------|----------|
| `COMMENTS_SERVICE_URL` | `http://comments.railway.internal:8001` |
| `NOTIFICATION_SERVICE_URL` | `http://notification.railway.internal:8002` |

> ⚠️ Имена должны точно совпадать с именами сервисов в Railway.

---

## Шаг 8. Запуск

После всех настроек Railway автоматически задеплоит сервисы.

1. Откройте сервис `web` → вкладка **Deployments**
2. Дождитесь зелёного статуса **Success**
3. Откройте сгенерированный домен → должен работать сайт!

---

## Проверка работы

| URL | Что должно быть |
|-----|-----------------|
| `https://<домен>/` | Главная страница |
| `https://<домен>/comments/` | Страница комментариев |
| `https://<домен>/feedback/` | Форма обратной связи |
| `https://<домен>/admin/` | Админка Django |

---

## Создание администратора Django

После первого деплоя:

1. Сервис `web` → вкладка **Settings** → **Service** → найти секцию **Custom Start Command** (или зайти в **Deployments** → **View Logs**)
2. Использовать **Railway CLI** (рекомендуется):

```bash
# Установить Railway CLI
npm i -g @railway/cli

# Залогиниться
railway login

# Привязать к проекту
railway link

# Выбрать сервис web и запустить команду
railway run --service web python football_blog/manage.py createsuperuser
```

---

## Что делать, если что-то сломалось

1. **Деплой не проходит** → откройте **Deployments** → **View Logs** → ищите ошибку.
2. **502 Bad Gateway** → проверьте, что приложение слушает `0.0.0.0:$PORT`, а не `localhost`.
3. **Static не загружается** → убедитесь, что `collectstatic` выполняется (см. логи).
4. **CSRF ошибки** → проверьте `CSRF_TRUSTED_ORIGINS` и `DJANGO_ALLOWED_HOSTS`.
5. **Микросервисы не общаются** → проверьте, что `*_SERVICE_URL` ссылаются на `.railway.internal`.

---

## Стоимость

- **Hobby Plan**: $5/месяц кредитов бесплатно
- Каждый сервис тратит ~$0.000463/час когда работает
- 3 сервиса + Postgres ≈ $3-4/месяц при постоянной работе
- **Засыпание**: Railway не усыпляет сервисы (в отличие от Render free)

---

## Локальный запуск (для тестирования)

Перед деплоем убедитесь, что всё работает локально:

```bash
# Скопируйте .env.example в .env и заполните
cp .env.example .env

# Запустите всё через Docker Compose
docker-compose up --build
```

Откройте http://localhost:8000
