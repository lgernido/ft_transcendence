from django.urls import path
from .consumers import GameConsumer
from .consumers import LobbyConsumer
from .consumers import DynamicGameConsumer
from .bot import GameBOTConsumer

websocket_urlpatterns = [
    path('ws/gamebot/<str:room_name>/', GameBOTConsumer.as_asgi()),
    path('ws/game/<str:room_name>/', GameConsumer.as_asgi()),
    path('ws/dynamic_game/<str:room_name>/', DynamicGameConsumer.as_asgi()),
    path('ws/dynamic_game/', DynamicGameConsumer.as_asgi()),
    path('ws/game/', GameConsumer.as_asgi()),
    path('ws/gamebot/', GameBOTConsumer.as_asgi()),
    path('ws/lobby/', LobbyConsumer.as_asgi()),

]
