from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .models import UserPresence
import json
from asgiref.sync import sync_to_async

import logging
logging = logging.getLogger(__name__)

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            await self.accept()

            await self.channel_layer.group_add("online_users", self.channel_name)

            self.user_channel_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.user_channel_name, self.channel_name)

            await self.update_user_presence(self.user, True)

            online_users = await self.get_online_users()

            await self.send(text_data=json.dumps({
                "type": "online_users_list",
                "online_users": online_users
            }))


            await self.channel_layer.group_send(
                "online_users", {
                    "type": "user_presence",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "status": "online",
                }
            )
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # Retirer l'utilisateur du groupe "online_users"
            await self.channel_layer.group_discard("online_users", self.channel_name)

            # Mettre à jour le statut de présence
            await self.update_user_presence(self.user, False)

            # Notifier les autres utilisateurs de la déconnexion
            await self.channel_layer.group_send(
                "online_users", {
                    "type": "user_presence",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "status": "offline",
                }
            )

    @sync_to_async
    def update_user_presence(self, user, is_online):
        user_presence, created = UserPresence.objects.get_or_create(user=user)
        user_presence.is_online = is_online
        user_presence.save()

    @sync_to_async
    def get_online_users(self):
        online_users = UserPresence.objects.filter(is_online=True)
        return [{"user_id": user.user.id, "username": user.user.username} for user in online_users]

    async def user_presence(self, event):
        await self.send(text_data=json.dumps(event))

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data["type"] == "send_invitation":
            user_id = data["user_id"]
            message = data["message"]
            room_name = data["room_name"]
            if room_name:
                target_group = f"user_{user_id}"

                await self.channel_layer.group_send(target_group, {
                    "type": "show_invitation_popup",
                    "message": message,
                    "room_name": room_name,
                    "user_id": user_id
                })

        elif data["type"] == "handle_invitation_response":
            response = data["response"]
            room_name = data["room_name"]
            user_id = data["user_id"]

            if response == "accept":
                await self.handle_invitation_acceptance(user_id, room_name)
            else:
                await self.handle_invitation_rejection(user_id, room_name)

    async def handle_invitation_acceptance(self, user_id, room_name):
        await self.channel_layer.group_send(
            room_name, {
                "type": "user_joined_room",
                "user_id": user_id,
                "room_name": room_name
            }
        )
        await self.send(text_data=json.dumps({
            "type": "invitation_accepted",
            "message": f"Tu as accepté l'invitation pour rejoindre {room_name}."
        }))

    async def handle_invitation_rejection(self, user_id, room_name):
        await self.send(text_data=json.dumps({
            "type": "invitation_rejected",
            "message": f"Tu as rejeté l'invitation pour rejoindre {room_name}."
        }))

    async def show_invitation_popup(self, event):
        """
        Cette méthode est appelée lorsqu'un message de type 'show_invitation_popup'
        est envoyé à ce consumer.
        """
        message = event["message"]
        room_name = event["room_name"]

        await self.send(text_data=json.dumps({
            "type": "show_invitation_popup",
            "message": message,
            "room_name": room_name,
            "user_id": event["user_id"]
        }))
