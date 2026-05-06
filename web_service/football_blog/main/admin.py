from django import forms
from django.contrib import admin
from django.contrib.auth.hashers import make_password

from .models import UserProfile


class UserProfileAdminForm(forms.ModelForm):
    raw_password = forms.CharField(
        widget=forms.PasswordInput,
        required=False,
        label="Новый пароль",
        help_text="Оставьте пустым, чтобы не менять текущий пароль",
    )

    class Meta:
        model = UserProfile
        exclude = ('password',)

    def save(self, commit=True):
        user = super().save(commit=False)
        raw = self.cleaned_data.get('raw_password')
        if raw:
            user.password = make_password(raw)
        elif not user.pk and not user.password:
            raise forms.ValidationError("Для нового пользователя требуется пароль")
        if commit:
            user.save()
        return user


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    form = UserProfileAdminForm
    list_display = ('username', 'firstname', 'lastname', 'email', 'created_at')
    search_fields = ('username', 'firstname', 'lastname')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)
