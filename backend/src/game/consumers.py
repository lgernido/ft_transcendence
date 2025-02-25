from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Room
from users.models import Social
import json
from channels.generic.websocket import AsyncWebsocketConsumer

import logging
logging = logging.getLogger(__name__)

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
        try:
            room = await self.get_room()
            if room:
                if self.scope['user'] == room.host:
                    await self.reset_roomname_for_all_users(room)
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "room_closed",
                            "message": "The host has left the room. The room is now closed."
                        }
                    )
                    await database_sync_to_async(room.delete)()
                else:
                    self.scope['session']['roomName'] = None
                    await self.save_session(self.scope['session'])

                    user = self.scope['user']
                    room.is_full = False
                    room.player1_ready = False
                    room.player2_ready = False
                    await database_sync_to_async(room.save)()
                    await self.remove_player_from_room(room, user)

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            "type": "player_left",
                            "player": self.scope['user'].username,
                        }
                    )
                    await self.send(text_data=json.dumps({
                        'status': 'success',
                        'message': 'You have left the room.'
                    }))
                    await self.send_room_state()
        except Exception as e:
            logging.error(f"Error in disconnect: {e}")
        finally:
            # Toujours retirer l'utilisateur du groupe
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)



    @database_sync_to_async
    def get_room(self):
        return Room.objects.select_related('host').filter(name=self.room_name).first()

    @database_sync_to_async
    def get_players(self, room):
        return room.players.all()

    @database_sync_to_async
    def get_host(self, room):
        if not room:
            return None
        return getattr(room, 'host', None)

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
    def remove_player_from_room(self, room, user):
        room.players.remove(user)
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

        elif data['type'] == 'start_game':
            self.scope['session']['roomName'] = None
            await self.save_session(self.scope['session'])
        
            room = await self.get_room()
            if room:
                await self.reset_roomname_for_all_users(room)
                if room.player1_ready and room.player2_ready and room.player1_color != room.player2_color and room.player1_color != "color-player-default" and room.player2_color != "color-player-default":
                    host = await self.get_host(room)
                    
                    AllPlayers = await self.get_players(room)
                    player2 = await self.get_second_player(AllPlayers, host.id)

                    socialHost = await self.get_social_for_user(host)
                    socialPlayer2 = await self.get_social_for_user(player2) if player2 else None

                    response_data = {
                        'type': 'start_game',
                        'player1': {
                            "username": host.username,
                            'ready': room.player1_ready,
                            "color": room.player1_color,
                            "avatar": socialHost.avatar.url,
                        },
                        'player2': {
                            "username": player2.username if player2 else "Waiting for player",
                            'ready': room.player2_ready,
                            "color": room.player2_color,
                            "avatar": socialPlayer2.avatar.url if player2 else "/media/avatars/default_avatar.png",
                        }
                    }

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'send_message',
                            'message': response_data
                        }
                    )


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
                "username": player2.username if player2 else "Waiting for player",
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

    async def room_closed(self, event):
        await self.send(text_data=json.dumps({
            "type": "room_closed",
            "message": event["message"]
        }))
        await self.close()

    async def player_left(self, event):
        # Récupère le nom du joueur qui a quitté
        player = event["player"]

        # Diffuse une mise à jour aux clients restants
        await self.send(text_data=json.dumps({
            "type": "player_left",
            "message": f"{player} has left the room."
        }))

        # Optionnel : Met à jour les informations de la salle si nécessaire
        await self.send_room_state()

    async def send_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def reset_roomname_for_all_users(self, room):
        """
        Supprime la variable de session `roomName` pour tous les utilisateurs d'une room.
        """
        from django.contrib.sessions.models import Session
        from django.contrib.auth.models import User

        # Obtenir toutes les sessions
        sessions = Session.objects.all()

        for session in sessions:
            try:
                # Décoder les données de la session
                session_data = session.get_decoded()
                user_id = session_data.get('_auth_user_id')

                # Vérifier si l'utilisateur est dans la room
                if user_id and int(user_id) in room.players.values_list('id', flat=True):
                    # Supprimer la variable `roomName`
                    if 'roomName' in session_data:
                        del session_data['roomName']

                    # Sauvegarder les modifications
                    session.session_data = Session.objects.encode(session_data)
                    session.save()
            except Exception as e:
                # Ignorer les erreurs pour éviter d'interrompre le processus
                print(f"Erreur lors de la mise à jour de la session : {e}")

