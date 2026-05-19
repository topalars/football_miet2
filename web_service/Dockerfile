FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway передаёт порт через $PORT; локально по умолчанию 8000.
ENV PORT=8000
EXPOSE 8000

# В DEV (DJANGO_DEBUG=1) — runserver, в PROD — gunicorn + collectstatic + migrate.
CMD ["sh", "-c", "cd football_blog && \
    if [ \"$DJANGO_DEBUG\" = \"1\" ]; then \
        python manage.py migrate --noinput && \
        python manage.py runserver 0.0.0.0:${PORT}; \
    else \
        python manage.py collectstatic --noinput && \
        python manage.py migrate --noinput && \
        gunicorn -b 0.0.0.0:${PORT} -w 2 football_blog.wsgi:application; \
    fi"]
