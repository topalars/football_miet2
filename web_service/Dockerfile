FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# В DEV (DJANGO_DEBUG=1) запускается runserver, в PROD — gunicorn.
CMD ["sh", "-c", "if [ \"$DJANGO_DEBUG\" = \"1\" ]; then \
        cd football_blog && python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000; \
    else \
        cd football_blog && python manage.py migrate --noinput && \
        gunicorn -b 0.0.0.0:8000 -w 2 football_blog.wsgi:application; \
    fi"]
