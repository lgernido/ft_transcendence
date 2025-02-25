import json
from datetime import datetime
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from .models import Channel, Message
from asgiref.sync import sync_to_async

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['channel_id']
        self.user = self.scope['user']

         # Identifier le type de canal en fonction du préfixe
        if self.channel_id.startswith("party_"):  # Canal de type 'party'
            self.channel_id = self.channel_id[6:]  # Retirer le préfixe "&"
            self.channel = await self.get_or_create_party_channel()

        elif self.channel_id.startswith("public_"):  # Canal public
            self.channel_id = self.channel_id[7:]  # Retirer le préfixe "#"
            self.channel = await self.get_or_create_public_channel()

        elif self.channel_id.startswith("private_"):  # Canal privé
            user2_id = self.channel_id[8:]  # Retirer le préfixe "#"       
            self.user1, self.user2 = await self.get_users(self.user.id, int(user2_id))
            
            if not self.user1 or not self.user2:
                await self.close(code=4002)
            self.channel = await self.get_or_create_channel(self.user.id, int(user2_id))
        else:
            await self.close(code=4001)

        # # Vérifier si l'utilisateur est autorisé à rejoindre ce canal
        # if not await self.channel.is_user_allowed(self.user):
        #     await self.close(code=403)  # Code d'erreur 403 : accès refusé
        #     return

        # self.group_name = f"channel_{self.channel_id}"
        self.group_name = f"channel_{self.channel.unique_identifier}"


        # Ajouter le canal au groupe et accepter la connexion WebSocket
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

    @database_sync_to_async
    def get_users(self, user1_id, user2_id):
        """Récupère les deux utilisateurs en fonction de leurs ID."""
        try:
            user1 = User.objects.get(id=user1_id)
            user2 = User.objects.get(id=user2_id)
            return user1, user2
        except User.DoesNotExist:
            return None, None

    @database_sync_to_async
    def get_or_create_channel(self, user1_id, user2_id):
        user1_id, user2_id = sorted([user1_id, user2_id])
        id_chan = f"private_{user1_id}-{user2_id}"

        # Si le canal n'existe pas, le créer
        channel, created = Channel.objects.get_or_create(
            unique_identifier=id_chan,
            defaults={
                'name': f'Private Channel {self.user1.username} & {self.user2.username}',
                'mode': 1
                }
            )

        if created:
            channel.users.add(self.user1, self.user2)
            channel.save()
        return channel
    
    @database_sync_to_async
    def get_or_create_public_channel(self):
        """Crée ou récupère un canal public."""
        channel, created = Channel.objects.get_or_create(
            unique_identifier=self.channel_id,
            defaults={
                'name': f'Public Channel {self.channel_id}',
                'mode': 2
            }
        )
        return channel

    @database_sync_to_async
    def get_or_create_party_channel(self):
        """Crée ou récupère un canal de type party."""
        channel, created = Channel.objects.get_or_create(
            unique_identifier=self.channel_id,
            defaults={
                'name': f'Party Channel {self.channel_id}',
                'mode': 3
            }
        )
        return channel
        
#====================================================================================================
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
#====================================================================================================
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
