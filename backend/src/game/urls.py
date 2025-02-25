from django.urls import path 
from . import views
from users.views import create_account
from django.conf.urls.i18n import i18n_patterns
from django.views.i18n import set_language
from users.views import create_account, GetUserId, GetUserById, GetUserByName, GetUser42

urlpatterns = [
    path('', views.home, name='home_page'),
    path('create_account/', create_account, name='create_account'),
    path('mypage/', views.mypage, name='mypage'),
    path('lobby_private/', views.lobby_private, name='lobby_private'),
    path('lobby_public/', views.lobby_public, name='lobby_public'),
    path('lobby_tournament/', views.lobby_tournament, name='lobby_tournament'),
    path('stats/', views.stats, name='stats'),
    path('chat/', views.chat, name='chat'),
    path('connect/', views.connect, name='connect'),
    path('game/', views.game, name='game'),
    path('lobby/', views.lobby, name='lobby'),
    path('amis/', views.amis, name='amis'),
    path('compte/', views.compte, name='compte'),
	path('header/', views.header, name='header'),
	path('logout/', views.logout_view, name='logout'),
	path('log_user/', views.log_user, name='log_user'),
    path('set_language/', set_language, name='set_language'),
    path('check_user_status/', views.check_user_status, name='check_user_status'),
    path('GameBot/', views.GameBot, name='GameBot'),
	path('local/', views.local, name='local'),
    path('tournament/', views.tournament, name='tournament'),
	
    path('create_roomP/', views.create_roomP, name='create_roomP'),
    path('delete_empty_rooms/', views.delete_empty_rooms, name='delete_empty_rooms'),
    path('find_or_create_room/', views.find_or_create_room, name='find_or_create_room'),
	path('join_room/<str:room_name>/', views.join_room, name='join_room'),

    path('set_language/', views.set_language, name='set_language'),
	path('check_user_status/', views.check_user_status, name='check_user_status'),
	path('extractProfile/', views.extractProfile, name='extractProfile'),
	path('extractGame/', views.extractGame, name='extractGame'),
	path('reset_room_session/', views.reset_room_session, name='reset_room_session'),

	path('GetUserId/', GetUserId, name="GetUserId"),
	path('GetUserById/', GetUserById, name="GetUserById"),
	path('GetUserByName/', GetUserByName, name="GetUserByName"),
	path('GetUser42/', GetUser42, name='GetUser42'),
]
