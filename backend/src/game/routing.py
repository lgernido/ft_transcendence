from django.urls import path
from .consumers import GameConsumer
from .consumers import LobbyConsumer
from .consumers import DynamicGameConsumer

websocket_urlpatterns = [
    path('ws/game/<str:room_name>/', GameConsumer.as_asgi()),
    path('ws/dynamic_game/<str:room_name>/', DynamicGameConsumer.as_asgi()),
    path('ws/dynamic_game/', DynamicGameConsumer.as_asgi()),
    path('ws/game/', GameConsumer.as_asgi()),
    path('ws/lobby/', LobbyConsumer.as_asgi()),

]
