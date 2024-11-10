from django.urls import path 
from . import views
from users.views import create_account

urlpatterns = [
    path('', views.home, name='home_page'),
    path('create_account/', create_account, name='create_account'),
    path('mypage/', views.mypage, name='mypage'),
    path('lobby_private/', views.lobby_private, name='lobby_private'),
    path('lobby_tournament/', views.lobby_tournament, name='lobby_tournament'),
    path('stats/', views.stats, name='stats'),
    path('chat/', views.chat, name='chat'),
    path('connect/', views.connect, name='connect'),
    path('game/', views.game, name='game'),
    path('lobby/', views.lobby, name='lobby'),
    path('amis/', views.amis, name='amis'),
    path('compte/', views.compte, name='compte'),
	path('header/', views.header, name='header'),
    path('store_colors/', views.store_colors, name='store_colors'),
	path('', views.logout_view, name='logout'),
]