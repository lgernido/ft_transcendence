import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Channel, Message

class ConversationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # L'utilisateur doit être authentifié
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()  # Ferme la connexion si l'utilisateur n'est pas authentifié

        # Créer un groupe unique par utilisateur
        self.group_name = f"user_{self.user.id}"
        
        # Rejoindre le groupe (un canal spécifique à l'utilisateur)
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Envoyer un message de bienvenue ou d'initialisation
        await self.send(text_data=json.dumps({
            'message': 'Connexion réussie'
        }))
        
        # Récupérer et envoyer les conversations
        conversations = await self.get_user_conversations()
        await self.send(text_data=json.dumps({
            'conversations': conversations
        }))

    async def disconnect(self, close_code):
        # Quitter le groupe quand la connexion est fermée
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    @sync_to_async
    def get_user_conversations(self):
        user = self.user
        # Récupérer tous les channels où l'utilisateur est présent
        channels = Channel.objects.filter(users=user)

        conversations = []
        for channel in channels:
            last_message = channel.last_message
            if last_message:
                # Identifier les autres utilisateurs dans le channel (exclure l'utilisateur courant)
                other_users = channel.users.exclude(id=user.id)
                other_users_data = [{'id': u.id, 'username': u.username} for u in other_users]

                conversations.append({
                    'channel_id': channel.id,
                    'channel_name': channel.name,
                    'participants': other_users_data,
                    'last_message': {
                        'sender': last_message.sender.username,
                        'content': last_message.content,
                        'timestamp': last_message.timestamp.isoformat(),
                        'is_read': user in last_message.is_read_by.all()
                    }
                })
        return conversations
