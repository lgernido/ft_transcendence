from django.urls import path
from . import views

urlpatterns = [
    path('search_users/', views.search_users, name='search_users'),
    path('load_messages/', views.load_messages, name='load_messages'),
    path('get_current_user/', views.get_current_user, name='get_current_user'),
	path('user_conversations/', views.user_conversations, name='user_conversations')
]
