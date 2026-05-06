"""Тонкий клиент Telegram Bot API. Токен и chat_id читаются из ENV."""
import logging
import os

import requests

logger = logging.getLogger(__name__)

BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
API_URL = "https://api.telegram.org/bot{token}/sendMessage"


def is_configured() -> bool:
    return bool(BOT_TOKEN and CHAT_ID)


def send_message(name: str, email: str, message: str) -> bool:
    if not is_configured():
        logger.info("telegram not configured, skipping send")
        return False

    payload = {
        "chat_id": CHAT_ID,
        "text": (
            f"<b>Новое сообщение с сайта</b>\n"
            f"От: {name}\n"
            f"Email: {email}\n\n"
            f"{message}"
        ),
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    try:
        r = requests.post(API_URL.format(token=BOT_TOKEN), json=payload, timeout=5)
        if r.status_code == 200:
            return True
        logger.warning("telegram returned status=%s", r.status_code)
        return False
    except requests.RequestException:
        logger.exception("telegram send failed")
        return False
