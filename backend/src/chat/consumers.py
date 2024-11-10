import json
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import Channel, Message
from asgiref.sync import sync_to_async

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['channel_id']
        self.user = self.scope['user']

        try:
            self.channel = await sync_to_async(Channel.objects.get)(id=self.channel_id)
        except Channel.DoesNotExist:
            await self.close()
            return

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
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Enregistrer le message et obtenir l'ID
        message_id = await self.save_message(message)

        # Envoyer le message à tous les utilisateurs dans le groupe
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username,
                'timestamp': str(datetime.now()),
                'message_id': message_id
            }
        )
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp'],
            'message_id': event['message_id']
        }))

    @sync_to_async
    def save_message(self, content):
        message = Message.objects.create(
            sender=self.user,
            channel=self.channel,
            content=content
        )
        return message.id