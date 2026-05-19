FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Railway передаёт порт через $PORT; локально по умолчанию 8001.
ENV PORT=8001
EXPOSE 8001

CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT} -w 2 app:app"]
