from django.urls import path
from .consumers import PresenceConsumer

websocket_urlpatterns = [
    path("ws/users/presence/", PresenceConsumer.as_asgi()),
]