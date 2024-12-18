from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('chat2/chat/<str:channel_id>/', consumers.ChatConsumer.as_asgi()),
]
