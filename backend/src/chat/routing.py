from django.urls import path
from . import consumers, consumers_update

websocket_urlpatterns = [
    path('ws/chat2/chat/<str:channel_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/chat2/conversations/', consumers_update.ConversationsConsumer.as_asgi()),
]
