import logging
import os
import re
import sqlite3
from datetime import datetime

from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS

import telegram_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024  # 32 KB

CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:8000").split(",") if o.strip()]
CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}})

DB_PATH = os.environ.get("NOTIFICATIONS_DB", "notifications.db")

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MAX_NAME_LEN = 100
MAX_EMAIL_LEN = 254
MAX_MESSAGE_LEN = 2000


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                sent_to_telegram INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
        ''')
        conn.commit()
    finally:
        conn.close()
    logger.info("notifications.db initialized")


init_db()

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Сервис уведомлений</title>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 { color: #333; border-bottom: 3px solid #2196F3; padding-bottom: 10px; }
        .form-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        input, textarea {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
        }
        input:focus, textarea:focus { outline: none; border-color: #2196F3; }
        button {
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(33,150,243,0.4); }
        .notification-item {
            background: white;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .name { font-weight: bold; color: #2196F3; font-size: 16px; }
        .email { color: #666; font-size: 13px; margin-left: 10px; }
        .date { font-size: 11px; color: #999; display: block; margin-top: 5px; }
        .message { margin-top: 10px; color: #333; background: #f9f9f9; padding: 10px; border-radius: 5px; }
        .status { font-size: 11px; color: #4CAF50; margin-left: 10px; }
        .no-notifications { text-align: center; color: #999; padding: 40px; }
    </style>
</head>
<body>
    <h1>Футбольный портал — Обратная связь</h1>

    <div class="form-container">
        <h3>Отправить сообщение</h3>
        <input type="text" id="name" placeholder="Ваше имя" maxlength="100">
        <input type="email" id="email" placeholder="Email" maxlength="254">
        <textarea id="message" placeholder="Ваше сообщение" rows="3" maxlength="2000"></textarea>
        <button onclick="sendMessage()">Отправить сообщение</button>
    </div>

    <h2>История сообщений</h2>
    <div id="notifications"></div>

    <script>
        async function loadNotifications() {
            try {
                const response = await fetch('/notifications');
                const data = await response.json();
                const container = document.getElementById('notifications');
                container.replaceChildren();

                if (!data.notifications || data.notifications.length === 0) {
                    const empty = document.createElement('div');
                    empty.className = 'no-notifications';
                    empty.textContent = 'Нет отправленных сообщений';
                    container.appendChild(empty);
                    return;
                }

                data.notifications.forEach(n => {
                    const item = document.createElement('div');
                    item.className = 'notification-item';

                    const head = document.createElement('div');
                    const nm = document.createElement('span');
                    nm.className = 'name';
                    nm.textContent = n.name;
                    const em = document.createElement('span');
                    em.className = 'email';
                    em.textContent = n.email;
                    const st = document.createElement('span');
                    st.className = 'status';
                    st.textContent = n.sent_to_telegram ? 'Отправлено' : 'В очереди';
                    head.appendChild(nm);
                    head.appendChild(em);
                    head.appendChild(st);

                    const msg = document.createElement('div');
                    msg.className = 'message';
                    msg.textContent = n.message;

                    const dt = document.createElement('div');
                    dt.className = 'date';
                    dt.textContent = n.created_at;

                    item.appendChild(head);
                    item.appendChild(msg);
                    item.appendChild(dt);
                    container.appendChild(item);
                });
            } catch (error) {
                console.error('Ошибка загрузки');
            }
        }

        async function sendMessage() {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name) return alert('Введите ваше имя');
            if (!email) return alert('Введите email');
            if (!message) return alert('Введите сообщение');

            try {
                const response = await fetch('/notifications', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, email, message })
                });

                const result = await response.json();

                if (result.success) {
                    alert('Сообщение отправлено!');
                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('message').value = '';
                    loadNotifications();
                } else {
                    alert('Ошибка: ' + (result.message || ''));
                }
            } catch (error) {
                alert('Ошибка отправки');
            }
        }

        loadNotifications();
        setInterval(loadNotifications, 5000);
    </script>
</body>
</html>
'''


@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)


@app.route('/notifications', methods=['GET'])
def get_notifications():
    conn = get_db()
    try:
        rows = conn.execute(
            'SELECT id, name, email, message, sent_to_telegram, created_at '
            'FROM notifications ORDER BY id DESC LIMIT 50'
        ).fetchall()
    finally:
        conn.close()
    return jsonify({'notifications': [dict(row) for row in rows]})


@app.route('/notifications', methods=['POST'])
def add_notification():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    message = (data.get('message') or '').strip()

    if not name or not email or not message:
        return jsonify({'success': False, 'message': 'Заполните все поля'}), 400
    if len(name) > MAX_NAME_LEN or len(email) > MAX_EMAIL_LEN or len(message) > MAX_MESSAGE_LEN:
        return jsonify({'success': False, 'message': 'Слишком длинное значение'}), 400
    if not EMAIL_RE.match(email):
        return jsonify({'success': False, 'message': 'Некорректный email'}), 400

    created_at = datetime.utcnow().strftime('%d.%m.%Y %H:%M')

    sent = telegram_client.send_message(name, email, message)

    conn = get_db()
    try:
        cursor = conn.execute(
            'INSERT INTO notifications (name, email, message, sent_to_telegram, created_at) '
            'VALUES (?, ?, ?, ?, ?)',
            (name, email, message, 1 if sent else 0, created_at),
        )
        conn.commit()
        new_id = cursor.lastrowid
    finally:
        conn.close()

    logger.info("notification stored id=%s telegram=%s", new_id, sent)
    return jsonify({'success': True, 'message': 'Сообщение сохранено'})


if __name__ == '__main__':
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host='0.0.0.0', port=8002, debug=debug)
