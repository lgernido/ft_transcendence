# from django.urls import re_path, path
# from .pongConsumers import PongConsumer

# websocket_urlpatterns = [
#     path("ws/pong/<str:room_name>/", PongConsumer.as_asgi()),
# ]

from django.urls import path, re_path
from .pongConsumers import PongConsumer
from .consumers import GameRoomConsumer

websocket_urlpatterns = [
    re_path(r'ws/lobby/(?P<room_name>\w+)/$', GameRoomConsumer.as_asgi()),
    path("ws/pong/<str:room_name>/<int:his_hote>/<str:his_color>/<int:score_limit>/", PongConsumer.as_asgi()),
]
