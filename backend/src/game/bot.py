import json
import asyncio
import uuid
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from .botGame import PongGameBOT
from .utils import serialize_game_state
from asyncio import sleep
from .models import Game
from users.models import Profile
from django.contrib.auth.models import User 
from asgiref.sync import sync_to_async

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
        last_ai_move = 0
        while self.running:
            self.game.move_ball()

            current_time = time.time()
            if current_time - last_ai_move >= 1:
                self.control_ai()
                last_ai_move = current_time

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

            await sleep(0.1)

    async def control_ai(self):
        predicted_y = self.game.predict_ball_position()
        ai_bar_pos = self.game.right_bar_pos

        bar_height = 30 
        ball_radius = 1
        bar_correction = bar_height / 2 + ball_radius

        distance = predicted_y - ai_bar_pos
        speed_factor = min(3, max(2.5, abs(distance) / 10))

        if abs(distance) > bar_correction:
            direction = speed_factor if distance > 0 else -speed_factor
        else:
            direction = 0

        self.game.move_bar("right", direction)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if text_data_json["type"] == "set_max_points":
            max_points = int(text_data_json.get("max_points", 5))
            self.game.limit_points = max_points

        if text_data_json["type"] == "over_game":
            user = await sync_to_async(User.objects.get)(username=text_data_json["user1"])
            profile = await sync_to_async(Profile.objects.get)(user=user)
            
            profile.games_played += 1
            if text_data_json["winner"] == "left":
                profile.games_win += 1
            else:
                profile.games_lose += 1

            await sync_to_async(profile.save)()

            player2 = await sync_to_async(User.objects.get)(username="bot")
            game = await sync_to_async(Game.objects.create)(
                player1=user,
                player2=player2,
                winner=user if text_data_json["winner"] == "left" else player2,
                player1_score=self.game.left_score,
                player2_score=self.game.right_score,
                date_played=time.strftime('%Y-%m-%d %H:%M:%S'),
            )

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

    async def close_socket(self, event):
        await self.close()