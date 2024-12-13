import json
import asyncio
import logging
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from .botGame import PongGameBOT
from .utils import serialize_game_state
from asyncio import sleep

class GameBOTConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs'].get('room_name')
        if self.room_name is None:
            self.room_name = "default"
        self.room_group_name = f'game_{self.room_name}'

        self.game = PongGameBOT(limit_points=5)
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
            self.control_ai()

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

            await sleep(0.015)

    async def control_ai(self):
        predicted_y = self.game.predict_ball_position()

        ai_bar_pos = self.game.right_bar_pos

        distance = abs(predicted_y - ai_bar_pos)
    
        if distance < 5:
            direction = 0 
        else:
            speed_factor = 2 + (distance / 100) 
            if predicted_y < ai_bar_pos:
                direction = -speed_factor  # Monter
            elif predicted_y > ai_bar_pos:
                direction = speed_factor  # Descendre
            else:
                direction = 0  # Rester immobile

        self.game.move_bar("right", direction)

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
        
        elif text_data_json["type"] == "stop_game":
            self.game.isAtive = False
            self.running = False
            self.game.reset_ball()
            if hasattr(self, 'game_task'):
                self.game_task.cancel
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_update',
                    **serialize_game_state(self.game)
                }
            )

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