from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class UserProfile(models.Model):
    username = models.CharField(max_length=50, unique=True, verbose_name="Логин")
    password = models.CharField(max_length=128, verbose_name="Пароль")
    firstname = models.CharField(max_length=50, verbose_name="Имя")
    lastname = models.CharField(max_length=50, verbose_name="Фамилия")
    email = models.EmailField(blank=True, null=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата регистрации")

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.username})"

    def set_password(self, raw_password: str) -> None:
        self.password = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password(raw_password, self.password)

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
