from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('wss/chat2/chat/<str:channel_id>/', consumers.ChatConsumer.as_asgi()),
]
