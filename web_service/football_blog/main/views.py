import json
import logging
import re

import requests
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

from .models import UserProfile

logger = logging.getLogger(__name__)

USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")
NAME_RE = re.compile(r"^[А-ЯA-ZЁ][а-яa-zё]{1,49}$")
PHONE_RE = re.compile(r"^\+7-\d{3}-\d{3}-\d{2}-\d{2}$")
MIN_PASSWORD_LEN = 6
MAX_PASSWORD_LEN = 128

MAX_REGISTER_BODY = 4 * 1024
MAX_FEEDBACK_BODY = 8 * 1024
MAX_COMMENT_BODY = 4 * 1024

GENERIC_REGISTER_ERROR = "Регистрация невозможна. Проверьте данные."


def index(request):
    return render(request, 'index.html')


def news(request):
    return render(request, 'news.html')


def matches(request):
    return render(request, 'matches.html')


def register(request):
    return render(request, 'register.html')


def feedback(request):
    return render(request, 'feedback.html')


def comments_page(request):
    return render(request, 'comments.html')


def _parse_json(request, max_size):
    if len(request.body) > max_size:
        return None, JsonResponse(
            {'success': False, 'message': 'Слишком большой запрос'}, status=413
        )
    try:
        return json.loads(request.body), None
    except json.JSONDecodeError:
        return None, JsonResponse(
            {'success': False, 'message': 'Неверный формат данных'}, status=400
        )


@require_http_methods(["POST"])
def api_register(request):
    data, err = _parse_json(request, MAX_REGISTER_BODY)
    if err:
        return err

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    firstname = (data.get('firstname') or '').strip()
    lastname = (data.get('lastname') or '').strip()
    email = (data.get('email') or '').strip()
    phone = (data.get('phone') or '').strip()

    if not USERNAME_RE.match(username):
        return JsonResponse({'success': False, 'message': GENERIC_REGISTER_ERROR}, status=400)
    if not (MIN_PASSWORD_LEN <= len(password) <= MAX_PASSWORD_LEN):
        return JsonResponse({'success': False, 'message': GENERIC_REGISTER_ERROR}, status=400)
    if not NAME_RE.match(firstname) or not NAME_RE.match(lastname):
        return JsonResponse({'success': False, 'message': GENERIC_REGISTER_ERROR}, status=400)
    if email:
        try:
            EmailValidator()(email)
        except ValidationError:
            return JsonResponse({'success': False, 'message': GENERIC_REGISTER_ERROR}, status=400)
    if phone and not PHONE_RE.match(phone):
        return JsonResponse({'success': False, 'message': GENERIC_REGISTER_ERROR}, status=400)

    try:
        UserProfile.objects.create(
            username=username,
            password=make_password(password),
            firstname=firstname,
            lastname=lastname,
            email=email or None,
            phone=phone or None,
        )
    except IntegrityError:
        # Не раскрываем, занят логин или другая причина — защита от user enumeration.
        return JsonResponse({'success': False, 'message': GENERIC_REGISTER_ERROR}, status=400)
    except Exception:
        logger.exception("api_register failed")
        return JsonResponse(
            {'success': False, 'message': 'Внутренняя ошибка'}, status=500
        )

    return JsonResponse({
        'success': True,
        'message': f'✅ Регистрация прошла успешно! Добро пожаловать, {firstname}!'
    })


@require_http_methods(["POST"])
def api_feedback(request):
    data, err = _parse_json(request, MAX_FEEDBACK_BODY)
    if err:
        return err

    payload = {
        'name': str(data.get('name', ''))[:100].strip(),
        'email': str(data.get('email', ''))[:254].strip(),
        'message': str(data.get('message', ''))[:2000].strip(),
    }
    if not payload['name'] or not payload['email'] or not payload['message']:
        return JsonResponse(
            {'success': False, 'message': 'Заполните все поля'}, status=400
        )
    try:
        EmailValidator()(payload['email'])
    except ValidationError:
        return JsonResponse(
            {'success': False, 'message': 'Некорректный email'}, status=400
        )

    try:
        response = requests.post(
            f'{settings.NOTIFICATION_SERVICE_URL}/notifications', json=payload, timeout=5
        )
        if response.status_code == 200:
            return JsonResponse({'success': True, 'message': 'Сообщение отправлено'})
        return JsonResponse(
            {'success': False, 'message': 'Не удалось сохранить сообщение'},
            status=502,
        )
    except requests.RequestException:
        logger.warning("notification service unavailable")
        return JsonResponse(
            {'success': False, 'message': 'Сервис уведомлений недоступен'}, status=503
        )


@require_http_methods(["GET"])
def api_comments(request):
    try:
        response = requests.get(f'{settings.COMMENTS_SERVICE_URL}/comments', timeout=5)
        if response.status_code == 200:
            return JsonResponse({'success': True, 'comments': response.json().get('comments', [])})
        return JsonResponse(
            {'success': False, 'message': 'Ошибка получения комментариев'},
            status=502,
        )
    except requests.RequestException:
        logger.warning("comments service unavailable")
        return JsonResponse(
            {'success': False, 'message': 'Сервис комментариев недоступен'},
            status=503,
        )


@require_http_methods(["POST"])
def api_add_comment(request):
    data, err = _parse_json(request, MAX_COMMENT_BODY)
    if err:
        return err

    payload = {
        'username': str(data.get('username', ''))[:50].strip(),
        'text': str(data.get('text', ''))[:500].strip(),
    }
    if not payload['username'] or not payload['text']:
        return JsonResponse(
            {'success': False, 'message': 'Заполните все поля'}, status=400
        )

    try:
        response = requests.post(
            f'{settings.COMMENTS_SERVICE_URL}/comments', json=payload, timeout=5
        )
        if response.status_code == 200:
            return JsonResponse({'success': True, 'message': 'Комментарий добавлен'})
        return JsonResponse(
            {'success': False, 'message': 'Не удалось добавить комментарий'},
            status=502,
        )
    except requests.RequestException:
        logger.warning("comments service unavailable")
        return JsonResponse(
            {'success': False, 'message': 'Сервис комментариев недоступен'},
            status=503,
        )
