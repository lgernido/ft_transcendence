import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import Channel, Message
from asgiref.sync import sync_to_async

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['channel_id']
        self.channel = await sync_to_async(Channel.objects.get)(id=self.channel_id)
        self.user = self.scope['user']

        if not self.channel.is_user_allowed(self.user):
            await self.close()
            return
        
        self.group_name = f"channel_{self.channel_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe WebSocket
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Recevoir un message depuis WebSocket
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Enregistrer le message dans la base de données
        await self.save_message(message)

        # Envoyer le message à tous les utilisateurs dans le groupe
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
    
    async def chat_message(self, event):
        # Envoyer un message à un utilisateur WebSocket
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @sync_to_async
    def save_message(self, content):
        # Sauvegarder le message dans la base de données
        message = Message.objects.create(
            sender=self.user,
            channel=self.channel,
            content=content
        )
        return message.id