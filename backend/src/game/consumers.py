import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import PongGame
from .utils import serialize_game_state
from asyncio import sleep

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs'].get('room_name')
        if self.room_name is None:
            self.room_name = "default"
        self.room_group_name = f'game_{self.room_name}'

        self.game = PongGame(limit_points=5)
        self.running = True

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.send(json.dumps({
            'type': 'game_state',
            **serialize_game_state(self.game)
        }))

        self.game_task = asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        self.running = False

        if hasattr(self, 'game_task'):
            self.game_task.cancel

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'close_socket',
            }
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
    async def game_loop(self):
        while self.running:
            self.game.move_ball()

            if self.game.is_game_over():
                winner = self.game.get_winner()
                self.running = False

                self.game.reset_ball()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_update',
                        **serialize_game_state(self.game)
                    }
                )

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_over',
                        'winner': winner
                    }
                )

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'close_socket',
                    }
                )
                break

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_update',
                    **serialize_game_state(self.game)
                }
            )

            await sleep(0.03)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if text_data_json["type"] == "set_max_points":
            max_points = int(text_data_json.get("max_points", 5))
            self.game.limit_points = max_points

        if text_data_json["type"] == "move":
            player = text_data_json["player"]
            direction = text_data_json["direction"]

            if player == "left":
                self.game.move_bar("left", direction)
            elif player == "right":
                self.game.move_bar("right", direction)

        elif text_data_json["type"] == "start_game":
            self.game.reset_ball()
            self.game.isAtive = True

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_update",
                **serialize_game_state(self.game),
            }
        )
    
    async def game_update(self, event):
        await self.send(json.dumps({
            "type": "game_state",
            **event,
        }))

    async def move_ball(self):
        self.game.move_ball()

        if self.game.is_game_over():
            winner = self.game.get_winner()
            self.running = False
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_over",
                    "winner": winner,
                }
            )
            return

        if self.game.check_collision("left", self.game.left_bar_pos):
            self.game.handle_collision("left")
        elif self.game.check_collision("right", self.game.right_bar_pos):
            self.game.handle_collision("right")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_update",
                **serialize_game_state(self.game),
            }
        )

    async def game_over(self, event):
        winner = event["winner"]
        await self.send(json.dumps({
            "type": "game_over",
            "winner": winner,
        }))

class LobbyConsumer(AsyncWebsocketConsumer):
    players = []

    async def connect(self):
        self.room_name = 'lobby'
        self.room_group_name = f'lobby_{self.room_name}'

        self.players.append(self.channel_name)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        if len(self.players) >= 2:
            await self.start_game()

        await self.accept()

    async def disconnect(self, close_code):
        self.players.remove(self.channel_name)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['action'] == 'player_joined':
            if len(self.players) == 2:
                await self.start_game()

    async def start_game(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_start',
                'status': 'start_game'
            }
        )

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            'status': 'start_game'
        }))