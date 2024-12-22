from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Room
from users.models import Social
import json
from channels.generic.websocket import AsyncWebsocketConsumer

import logging
logger = logging.getLogger(__name__)

class GameRoomConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'room_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        await self.send_room_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def get_room(self):
        return get_object_or_404(Room.objects.select_related('host'), name=self.room_name)

    @database_sync_to_async
    def get_players(self, room):
        return room.players.all()

    @database_sync_to_async
    def get_host(self, room):
        return room.host

    @database_sync_to_async
    def get_second_player(self, players, host_id):
        return players.exclude(id=host_id).first()

    @database_sync_to_async
    def get_social_for_user(self, user):
        return Social.objects.get(user=user)

    @database_sync_to_async
    def save_room_points_limit(self, room, points_limit):
        room.points_limit = points_limit
        room.save()

    @database_sync_to_async
    def save_session(self, session):
        session.save()

    def get_player_color(self, player):
        return self.scope['session'].get(f'color_{player.id}')
    
    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['type'] == 'color_change':
            player_id = data['playerId']
            color = data['color']

            room = await self.get_room()

            if player_id == 'player1':
                room.player1_color = color
            elif player_id == 'player2':
                room.player2_color = color

            await database_sync_to_async(room.save)()
            await self.send_room_state()

        elif data['type'] == 'points_limit_change':
            points_limit = data['points_limit']
            if not points_limit:
                points_limit = 5
            try:
                points_limit = int(points_limit)
            except ValueError:
                points_limit = 5

            if points_limit < 1:
                points_limit = 1
            elif points_limit > 40:
                points_limit = 40

            room = await self.get_room()
            await self.save_room_points_limit(room, points_limit)

            self.scope['session']['points_limit'] = points_limit
            await self.save_session(self.scope['session'])

            await self.send_room_state()

        elif data['type'] == 'ready_state_change':
            player_id = data['playerId']
            is_ready = data['ready']

            room = await self.get_room()
            if player_id == 'player1':
                room.player1_ready = is_ready
            elif player_id == 'player2':
                room.player2_ready = is_ready

            await database_sync_to_async(room.save)()
            await self.send_room_state()


    async def send_room_state(self):
        room = await self.get_room()

        host = await self.get_host(room)

        if not host:
            await self.send(text_data=json.dumps({"error": "No host assigned."}))
            return

        AllPlayers = await self.get_players(room)
        player2 = await self.get_second_player(AllPlayers, host.id)

        player1_color = room.player1_color
        player2_color = room.player2_color

        socialHost = await self.get_social_for_user(host)
        socialPlayer2 = await self.get_social_for_user(player2) if player2 else None

        points_limit = self.scope['session'].get('points_limit', 5)

        players_data = {
            "player1": {
                "username": host.username,
                "avatar": socialHost.avatar.url,
                "color": player1_color,
                "ready": room.player1_ready
            },
            "player2": {
                "username": player2.username if player2 else "Guest",
                "avatar": socialPlayer2.avatar.url if player2 else "/media/avatars/default_avatar.png",
                "color": player2_color if player2 else "",
                "ready": room.player2_ready
            },
            "points_limit": points_limit
        }
        # Envoyer les données des joueurs avec les couleurs au WebSocket
        await self.channel_layer.group_send(
        self.room_group_name,
        {
            'type': 'broadcast_room_state',
            'players_data': players_data
        }
    )
        
    async def broadcast_room_state(self, event):
        """
        Cette méthode est appelée pour diffuser l'état de la salle à tous les joueurs.
        Elle est appelée lorsque nous utilisons `group_send` pour envoyer un message à tous les membres du groupe.
        """
        players_data = event['players_data']
        
        await self.send(text_data=json.dumps(players_data))


