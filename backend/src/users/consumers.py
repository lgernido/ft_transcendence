from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from .models import UserPresence
import json
from asgiref.sync import sync_to_async

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            await self.accept()

            await self.channel_layer.group_add("online_users", self.channel_name)

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

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard("online_users", self.channel_name)

            await self.update_user_presence(self.user, False)

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