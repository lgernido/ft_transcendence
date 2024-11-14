from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat2/<str:channel_id>/', consumers.ChatConsumer.as_asgi()),
]
