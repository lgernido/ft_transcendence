from django.urls import path 
from . import views
from users.views import create_account
from django.conf.urls.i18n import i18n_patterns
from django.views.i18n import set_language
from .views import game_room
from users.views import create_account, GetUserId, GetUserById, GetUserByName, GetUser42

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
	path('logout/', views.logout_view, name='logout'),
	path('log_user/', views.log_user, name='log_user'),
    path('set_language/', set_language, name='set_language'),
    path('check_user_status/', views.check_user_status, name='check_user_status'),
	path('create_dynamic_room/', views.create_dynamic_room, name='create_dynamic_room'),
    path('dynamic_game/<str:room_name>/', views.dynamic_game_room, name='dynamic_game_room'),
    path('game/', views.game, name='game'),
    path('api/game-results/', views.game_results, name='game_results'),
    path('create_custom/', views.create_custom, name='create_custom'),
    path('create_room/', views.create_room, name='create_room'),
    path('create_tournament/', views.create_tournament, name='create_tournament'),
    path('custom/<str:room_name>/', views.game_custom, name='game_custom'),
    path('tournament/<str:room_name>/', views.game_tournament, name='game_tournament'),
    path('game/<str:room_name>/', views.game_room, name='game_room'),

    path('set_language/', views.set_language, name='set_language'),
	path('check_user_status/', views.check_user_status, name='check_user_status'),
	path('extractProfile/', views.extractProfile, name='extractProfile'),
	path('extractGame/', views.extractGame, name='extractGame'),
	

	path('GetUserId/', GetUserId, name="GetUserId"),
	path('GetUserById/', GetUserById, name="GetUserById"),
	path('GetUserByName/', GetUserByName, name="GetUserByName"),
	path('GetUser42/', GetUser42, name='GetUser42'),
]
