from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('news/', views.news, name='news'),
    path('matches/', views.matches, name='matches'),
    path('register/', views.register, name='register'),
    path('feedback/', views.feedback, name='feedback'),
    path('comments/', views.comments_page, name='comments'),
    path('api/comments/', views.api_comments, name='api_comments'),
    path('api/comments/add/', views.api_add_comment, name='api_add_comment'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/feedback/', views.api_feedback, name='api_feedback'),
]