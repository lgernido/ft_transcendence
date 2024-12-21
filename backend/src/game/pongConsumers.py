import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import logging

logger = logging.getLogger('game')


class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user = self.scope["user"]
        self.room_group_name = f"pong_{self.room_name}"

        # Ajouter le joueur au groupe
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Initialiser l'état du jeu s'il n'existe pas encore
        if not hasattr(self.channel_layer, "game_state"):
            self.channel_layer.game_state = {
                "ball": {"x": 0.5, "y": 0.5, "speed_x": 0, "speed_y": 0},
                "left_paddle": {"y": 0.5, "id": None},
                "right_paddle": {"y": 0.5, "id": None},
                "connected_players": 0,  # Nombre de joueurs connectés
            }

        # Augmenter le compteur de joueurs connectés
        self.channel_layer.game_state["connected_players"] += 1

        # Assigner l'utilisateur à une raquette
        game_state = self.channel_layer.game_state
        if game_state["left_paddle"]["id"] is None:
            game_state["left_paddle"]["id"] = self.user.id
        elif game_state["right_paddle"]["id"] is None:
            game_state["right_paddle"]["id"] = self.user.id

        # Vérifier si les deux joueurs sont connectés
        if game_state["connected_players"] == 2:
            # Commencer le mouvement de la balle
            game_state["ball"]["speed_x"] = 0.01
            game_state["ball"]["speed_y"] = 0.01

            # Informer tous les joueurs que le jeu commence
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_start",
                    "message": "Both players are connected. The game starts now!",
                },
            )
            asyncio.create_task(self.game_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        if hasattr(self.channel_layer, "game_state"):
            self.channel_layer.game_state["connected_players"] -= 1

    async def receive(self, text_data):
        logger.warning(f"Receive called by {self.user.username}")
        data = json.loads(text_data)

        if data["type"] == "move":
            game_state = self.channel_layer.game_state
            user_id = data["id"]
            pos = data["pos"]

            logger.warning("left_paddle ")
            logger.warning(pos)
            # Identifier quelle raquette doit être mise à jour
            if game_state["left_paddle"]["id"] == user_id:
                game_state["left_paddle"]["y"] = pos
            elif game_state["right_paddle"]["id"] == user_id:
                game_state["right_paddle"]["y"] = pos

    async def game_loop(self):
        while True:
            state = self.channel_layer.game_state
            ball = state["ball"]

            # Mettre à jour la position de la balle si elle est en mouvement
            if ball["speed_x"] != 0 and ball["speed_y"] != 0:
                # ball["x"] += ball["speed_x"]
                # ball["y"] += ball["speed_y"]

                # # Détection des collisions
                # if ball["y"] <= 0 or ball["y"] >= 1:
                #     ball["speed_y"] *= -1  # Collision avec le mur haut/bas

                left_paddle = state["left_paddle"]
                right_paddle = state["right_paddle"]
                

                # if (
                #     ball["x"] <= 0.05
                #     and left_paddle["y"] <= ball["y"] <= left_paddle["y"] + 0.2
                # ):
                #     ball["speed_x"] *= -1  # Collision avec la raquette gauche
                # elif (
                #     ball["x"] >= 0.95
                #     and right_paddle["y"] <= ball["y"] <= right_paddle["y"] + 0.2
                # ):
                #     ball["speed_x"] *= -1  # Collision avec la raquette droite

            # Envoyer l'état mis à jour à tous les clients
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_update",
                    "ball": ball,
                    "left_paddle": {
                        "y": left_paddle["y"],
                        "id": left_paddle["id"]
                    },
                    "right_paddle": {
                        "y": right_paddle["y"],
                        "id": right_paddle["id"]
                    },
                },
            )
            # await asyncio.sleep(0.016)  # 60 FPS
            await asyncio.sleep(1)  # 1 FPS


    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            "type": "start",
            "message": event["message"],
        }))
