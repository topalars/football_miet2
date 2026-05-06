import logging
import os
import sqlite3
from datetime import datetime

from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # 16 KB

CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:8000").split(",") if o.strip()]
CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}})

DB_PATH = os.environ.get("COMMENTS_DB", "comments.db")

MAX_USERNAME_LEN = 50
MAX_TEXT_LEN = 500


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    try:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        conn.commit()
    finally:
        conn.close()
    logger.info("comments.db initialized")


init_db()

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Сервис комментариев</title>
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
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
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
        input:focus, textarea:focus { outline: none; border-color: #4CAF50; }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102,126,234,0.4); }
        .comment {
            background: white;
            border-bottom: 1px solid #eee;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .username { font-weight: bold; color: #4CAF50; font-size: 16px; }
        .date { font-size: 11px; color: #999; margin-left: 10px; }
        .text { margin-top: 8px; color: #333; line-height: 1.5; }
        .no-comments { text-align: center; color: #999; padding: 40px; }
    </style>
</head>
<body>
    <h1>Футбольный портал — Комментарии</h1>

    <div class="form-container">
        <h3>Написать комментарий</h3>
        <input type="text" id="username" placeholder="Ваше имя" maxlength="50">
        <textarea id="text" placeholder="Ваш комментарий" rows="3" maxlength="500"></textarea>
        <button onclick="addComment()">Отправить комментарий</button>
    </div>

    <h2>Комментарии пользователей</h2>
    <div id="comments"></div>

    <script>
        async function loadComments() {
            try {
                const response = await fetch('/comments');
                const data = await response.json();
                const container = document.getElementById('comments');
                container.replaceChildren();

                if (!data.comments || data.comments.length === 0) {
                    const empty = document.createElement('div');
                    empty.className = 'no-comments';
                    empty.textContent = 'Пока нет комментариев. Будьте первым!';
                    container.appendChild(empty);
                    return;
                }

                data.comments.forEach(c => {
                    const div = document.createElement('div');
                    div.className = 'comment';

                    const header = document.createElement('div');
                    const u = document.createElement('span');
                    u.className = 'username';
                    u.textContent = c.username;
                    const d = document.createElement('span');
                    d.className = 'date';
                    d.textContent = c.created_at || '';
                    header.appendChild(u);
                    header.appendChild(d);

                    const t = document.createElement('div');
                    t.className = 'text';
                    t.textContent = c.text;

                    div.appendChild(header);
                    div.appendChild(t);
                    container.appendChild(div);
                });
            } catch (error) {
                console.error('Ошибка загрузки');
            }
        }

        async function addComment() {
            const username = document.getElementById('username').value.trim();
            const text = document.getElementById('text').value.trim();

            if (!username) return alert('Введите ваше имя');
            if (!text) return alert('Введите комментарий');

            try {
                await fetch('/comments', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ username, text })
                });

                document.getElementById('text').value = '';
                loadComments();
            } catch (error) {
                alert('Ошибка отправки');
            }
        }

        loadComments();
        setInterval(loadComments, 5000);
    </script>
</body>
</html>
'''


@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)


@app.route('/comments', methods=['GET'])
def get_comments():
    conn = get_db()
    try:
        rows = conn.execute(
            'SELECT id, username, text, created_at FROM comments ORDER BY id DESC LIMIT 100'
        ).fetchall()
    finally:
        conn.close()
    return jsonify({'comments': [dict(row) for row in rows]})


@app.route('/comments', methods=['POST'])
def add_comment():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    text = (data.get('text') or '').strip()

    if not username or not text:
        return jsonify({'success': False, 'message': 'Заполните все поля'}), 400
    if len(username) > MAX_USERNAME_LEN or len(text) > MAX_TEXT_LEN:
        return jsonify({'success': False, 'message': 'Слишком длинное значение'}), 400

    created_at = datetime.utcnow().strftime('%d.%m.%Y %H:%M')

    conn = get_db()
    try:
        cursor = conn.execute(
            'INSERT INTO comments (username, text, created_at) VALUES (?, ?, ?)',
            (username, text, created_at),
        )
        conn.commit()
        new_id = cursor.lastrowid
    finally:
        conn.close()

    logger.info("comment stored id=%s", new_id)
    return jsonify({'success': True, 'message': 'Комментарий добавлен'})


@app.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    conn = get_db()
    try:
        cursor = conn.execute('DELETE FROM comments WHERE id = ?', (comment_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({'success': False, 'message': 'Комментарий не найден'}), 404
    finally:
        conn.close()
    logger.info("comment deleted id=%s", comment_id)
    return jsonify({'success': True, 'message': 'Комментарий удалён'})


if __name__ == '__main__':
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host='0.0.0.0', port=8001, debug=debug)
