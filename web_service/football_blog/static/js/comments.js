document.addEventListener('DOMContentLoaded', function() {
    const commentsList = document.getElementById('comments-list');
    const usernameInput = document.getElementById('comment-username');
    const textInput = document.getElementById('comment-text');
    const submitBtn = document.getElementById('submit-comment');

    function getCookie(name) {
        const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return m ? decodeURIComponent(m.pop()) : '';
    }

    function showNotification(message, isSuccess) {
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;

        const content = document.createElement('div');
        content.className = 'notification-content';

        const span = document.createElement('span');
        span.textContent = `${isSuccess ? '✅' : '❌'} ${message}`;

        content.appendChild(span);
        notification.appendChild(content);
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async function loadComments() {
        try {
            const response = await fetch('/api/comments/', { credentials: 'same-origin' });
            const data = await response.json();

            if (data.success) {
                renderComments(data.comments || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки');
        }
    }

    function renderComments(comments) {
        commentsList.replaceChildren();

        if (!comments.length) {
            const empty = document.createElement('div');
            empty.className = 'no-comments';
            empty.textContent = 'Пока нет комментариев. Будьте первым!';
            commentsList.appendChild(empty);
            return;
        }

        const existingIds = new Set(
            [...commentsList.querySelectorAll('.comment-item')].map(el => parseInt(el.dataset.id, 10))
        );

        comments.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            if (!existingIds.has(comment.id)) item.classList.add('new');
            item.dataset.id = String(comment.id);

            const header = document.createElement('div');
            header.className = 'comment-header';

            const username = document.createElement('span');
            username.className = 'comment-username';
            username.textContent = `⚽ ${comment.username}`;

            const date = document.createElement('span');
            date.className = 'comment-date';
            date.textContent = comment.created_at || '';

            header.appendChild(username);
            header.appendChild(date);

            const text = document.createElement('div');
            text.className = 'comment-text';
            text.textContent = comment.text;

            item.appendChild(header);
            item.appendChild(text);
            commentsList.appendChild(item);
        });
    }

    async function addComment() {
        const username = usernameInput.value.trim();
        const text = textInput.value.trim();

        if (!username) {
            showNotification('Введите ваше имя', false);
            return;
        }
        if (!text) {
            showNotification('Введите комментарий', false);
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';

        try {
            const response = await fetch('/api/comments/add/', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ username, text })
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Комментарий отправлен!', true);
                textInput.value = '';
                loadComments();
            } else {
                showNotification(data.message || 'Ошибка', false);
            }
        } catch (error) {
            showNotification('Ошибка соединения', false);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    submitBtn.addEventListener('click', addComment);
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addComment();
        }
    });

    loadComments();
    setInterval(loadComments, 5000);
});
