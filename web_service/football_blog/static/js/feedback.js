document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');

    function getCookie(name) {
        const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return m ? decodeURIComponent(m.pop()) : '';
    }

    function validateEmail(input) {
        const errorElement = document.getElementById('email-error');
        const value = input.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (value === '') {
            errorElement.textContent = 'Email обязателен';
            return false;
        } else if (!emailPattern.test(value)) {
            errorElement.textContent = 'Введите корректный email';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    function validateName(input) {
        const errorElement = document.getElementById('name-error');
        const value = input.value.trim();

        if (value === '') {
            errorElement.textContent = 'Имя обязательно';
            return false;
        } else if (value.length < 2) {
            errorElement.textContent = 'Имя должно содержать минимум 2 символа';
            return false;
        } else if (value.length > 100) {
            errorElement.textContent = 'Имя слишком длинное';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    function validateMessage(input) {
        const errorElement = document.getElementById('message-error');
        const value = input.value.trim();

        if (value === '') {
            errorElement.textContent = 'Сообщение обязательно';
            return false;
        } else if (value.length < 10) {
            errorElement.textContent = 'Сообщение должно содержать минимум 10 символов';
            return false;
        } else if (value.length > 2000) {
            errorElement.textContent = 'Сообщение слишком длинное';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }

    document.getElementById('name').addEventListener('input', function() {
        validateName(this);
    });

    document.getElementById('email').addEventListener('input', function() {
        validateEmail(this);
    });

    document.getElementById('message').addEventListener('input', function() {
        validateMessage(this);
    });

    function showNotification(message, isSuccess) {
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;

        const content = document.createElement('div');
        content.className = 'notification-content';

        const icon = document.createElement('span');
        icon.className = 'notification-icon';
        icon.textContent = isSuccess ? '✅' : '❌';

        const msg = document.createElement('span');
        msg.className = 'notification-message';
        msg.textContent = message;

        content.appendChild(icon);
        content.appendChild(msg);
        notification.appendChild(content);
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const isNameValid = validateName(document.getElementById('name'));
        const isEmailValid = validateEmail(document.getElementById('email'));
        const isMessageValid = validateMessage(document.getElementById('message'));

        if (isNameValid && isEmailValid && isMessageValid) {
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            try {
                const response = await fetch('/api/feedback/', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    showNotification(result.message, true);
                    form.reset();
                } else {
                    showNotification(result.message, false);
                }
            } catch (error) {
                showNotification('Ошибка соединения с сервером', false);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } else {
            showNotification('Пожалуйста, исправьте ошибки в форме', false);
        }
    });
});
