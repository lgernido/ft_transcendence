from django.urls import path
from .consumers import GameConsumer
from .consumers import LobbyConsumer

websocket_urlpatterns = [
    path('ws/game/<str:room_name>/', GameConsumer.as_asgi()),
    path('ws/game/', GameConsumer.as_asgi()),
    path('ws/lobby/', LobbyConsumer.as_asgi()),

]