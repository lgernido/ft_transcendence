from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    # Route pour connecter à un canal de chat en fonction de l'ID du canal (channel_id)
    re_path(r'ws/chat/(?P<channel_id>\d+)/$', ChatConsumer.as_asgi()),

    # Si tu veux gérer des conversations privées, tu peux ajouter une autre route ici
    # re_path(r'ws/chat/private/(?P<user_id>\d+)/$', ChatConsumer.as_asgi()),
]
