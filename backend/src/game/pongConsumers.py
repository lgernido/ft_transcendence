import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import logging
import math
import random
from django.contrib.auth.models import User
from game.models import Game
from channels.db import database_sync_to_async

import logging
logger = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
    # Dictionnaire pour stocker les états de jeu par room
    game_states = {}
    
    # Constantes de jeu
    SAVE_GAME = False
    PADDLE_SPEED = 0.02  # Vitesse des raquettes
    BALL_SPEED = 0.01    # Vitesse constante de la balle
    PADDLE_HEIGHT = 0.2  # Hauteur des raquettes
    FPS = 60  # Taux de rafraîchissement
    FRAME_TIME = 1.0 / FPS  # Temps entre chaque frame
    MAX_SCORE = 3  # Score maximum pour gagner

    async def connect(self):
        logger.warning(f"Connecting to room: {self.scope['url_route']['kwargs']['room_name']}")
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user = self.scope["user"]
        self.room_group_name = f"pong_{self.room_name}"

        # Ajouter le joueur au groupe
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Initialiser l'état du jeu pour cette room s'il n'existe pas encore
        if self.room_name not in self.game_states:
            self.game_states[self.room_name] = {
                "ball": {"radius":0.01, "x": 0.5, "y": 0.5, "speed_x": 0, "speed_y": 0},
                "left_paddle": {"y": 0.45, "id": None, "score": 0, "name": ""},
                "right_paddle": {"y": 0.45, "id": None, "score": 0, "name": ""},
                "connected_players": 0,
            }

        # Augmenter le compteur de joueurs connectés pour cette room
        self.game_states[self.room_name]["connected_players"] += 1

        # Assigner l'utilisateur à une raquette
        game_state = self.game_states[self.room_name]
        if game_state["left_paddle"]["id"] is None:
            game_state["left_paddle"]["id"] = self.user.id
            game_state["left_paddle"]["name"] = self.user.username[:8]
            logger.warning(f"Left paddle assigned to user {self.user.username}")
        elif game_state["right_paddle"]["id"] is None:
            game_state["right_paddle"]["id"] = self.user.id
            game_state["right_paddle"]["name"] = self.user.username[:8]

        # Vérifier si les deux joueurs sont connectés
        if game_state["connected_players"] == 2:
            game_state["ball"]["speed_x"] = 0.01
            game_state["ball"]["speed_y"] = 0.01

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_start",
                    "message": "Both players are connected. The game starts now!",
                    "left_paddle": {
                        "id": game_state["left_paddle"]["id"],
                    },
                    "right_paddle": {
                        "id": game_state["right_paddle"]["id"],
                    },
                },
            )

            asyncio.create_task(self.game_loop())


    async def disconnect(self, close_code):
        """Gestion de la déconnexion d'un joueur"""
        logger.info(f"User {self.user.id} disconnected with code: {close_code}")
        
        if self.room_name in self.game_states:
            state = self.game_states[self.room_name]
            
            # Déterminer quel joueur s'est déconnecté et qui est le gagnant
            if state["left_paddle"]["id"] == self.user.id:
                winner_id = state["right_paddle"]["id"]
                forfeit_player = "left"
            else:
                winner_id = state["left_paddle"]["id"]
                forfeit_player = "right"

            # Sauvegarder le résultat si la partie était en cours
            if self.SAVE_GAME == False and (state["connected_players"] == 2):
                try:
                    await self.save_game_result(
                        player1_id=state["left_paddle"]["id"],
                        player2_id=state["right_paddle"]["id"],
                        winner_id=winner_id,
                        player1_score=state["left_paddle"]["score"],
                        player2_score=state["right_paddle"]["score"]
                    )
                except Exception as e:
                    logger.error(f"Error saving game result on disconnect: {e}")

            # Informer l'autre joueur avant de réinitialiser l'état
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "game_forfeit",
                        "message": f"{forfeit_player} player disconnected",
                        "winner_id": winner_id,
                        "final_score": {
                            "left": state["left_paddle"]["score"],
                            "right": state["right_paddle"]["score"]
                        }
                    }
                )

            # Supprimer l'état du jeu pour cette room au lieu de le réinitialiser
            del self.game_states[self.room_name]

        # Retirer le joueur du groupe et fermer la connexion
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


    async def receive(self, text_data):
        data = json.loads(text_data)
        if data["type"] == "game_exit":
            # Sauvegarder le jeu avec forfait
            state = self.game_states[self.room_name]
            user_id = int(data["id"])
            
            # Déterminer le gagnant (l'autre joueur)
            if state["left_paddle"]["id"] == user_id:
                winner_id = state["right_paddle"]["id"]
                forfeit_player = "left"
            else:
                winner_id = state["left_paddle"]["id"]
                forfeit_player = "right"

            # Informer l'autre joueur
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "game_forfeit",
                    "message": f"{forfeit_player} player forfeited",
                    "winner_id": winner_id
                }
            )

            # Fermer la connexion
            # await self.close()
            
        elif data["type"] == "move":
            user_id = int(data["id"])
            action = data["action"]
            game_state = self.game_states[self.room_name]

            # Appliquer le mouvement avec la vitesse définie côté serveur
            if game_state["left_paddle"]["id"] == user_id:
                if action == "up":
                    game_state["left_paddle"]["y"] = max(0, game_state["left_paddle"]["y"] - self.PADDLE_SPEED)
                elif action == "down":
                    game_state["left_paddle"]["y"] = min(0.8, game_state["left_paddle"]["y"] + self.PADDLE_SPEED)
            elif game_state["right_paddle"]["id"] == user_id:
                if action == "up":
                    game_state["right_paddle"]["y"] = max(0, game_state["right_paddle"]["y"] - self.PADDLE_SPEED)
                elif action == "down":
                    game_state["right_paddle"]["y"] = min(0.8, game_state["right_paddle"]["y"] + self.PADDLE_SPEED)

            await self.send_game_state(game_state)

    async def game_loop(self):
        last_update = asyncio.get_event_loop().time()

        while True:
            current_time = asyncio.get_event_loop().time()
            delta_time = current_time - last_update

            if delta_time >= self.FRAME_TIME:
                state = self.game_states[self.room_name]
                ball = state["ball"]
                
                if ball["speed_x"] != 0 and ball["speed_y"] != 0:
                    ball["x"] += ball["speed_x"] * delta_time * self.FPS
                    ball["y"] += ball["speed_y"] * delta_time * self.FPS

                # Vérifier si un point a été marqué
                if ball["x"] <= 0:
                    state["right_paddle"]["score"] += 1
                    await self.check_winner(state)
                    self.reset_ball(ball)
                elif ball["x"] >= 1:
                    state["left_paddle"]["score"] += 1
                    await self.check_winner(state)
                    self.reset_ball(ball)

                await self.handle_collisions(state, ball)
                await self.send_game_state(state)
                last_update = current_time
            
            await asyncio.sleep(0.001)

    def reset_ball(self, ball):
        """Réinitialise la position et la vitesse de la balle"""
        ball["x"] = 0.5
        ball["y"] = 0.5
        # Direction aléatoire mais vitesse constante
        angle = random.uniform(-45, 45)  # Angle de départ aléatoire entre -45° et 45°
        ball["speed_x"] = self.BALL_SPEED * math.cos(math.radians(angle))
        ball["speed_y"] = self.BALL_SPEED * math.sin(math.radians(angle))

    async def handle_collisions(self, state, ball):
        # Collision avec les murs
        if ball["y"] - ball["radius"] <= 0 or ball["y"] + ball["radius"] >= 1:
            ball["speed_y"] *= -1  # Simplement inverser la direction Y

        # Collision avec les raquettes
        left_paddle = state["left_paddle"]
        right_paddle = state["right_paddle"]
        
        # Collision avec la raquette gauche
        if (ball["x"] - ball["radius"] <= 0.02 and 
            left_paddle["y"] <= ball["y"] <= left_paddle["y"] + self.PADDLE_HEIGHT):
            # Calculer l'angle de rebond basé sur le point d'impact
            impact_point = (ball["y"] - left_paddle["y"]) / self.PADDLE_HEIGHT
            angle = 75 * (2 * impact_point - 1)  # Angle entre -75° et 75°

            # Maintenir une vitesse constante
            ball["speed_x"] = self.BALL_SPEED * math.cos(math.radians(angle))
            ball["speed_y"] = self.BALL_SPEED * math.sin(math.radians(angle))
            ball["speed_x"] = abs(ball["speed_x"])  # Vers la droite
            
            # Éviter que la balle ne reste coincée
            ball["x"] = 0.02 + ball["radius"]
            
        # Collision avec la raquette droite
        elif (ball["x"] + ball["radius"] >= 0.98 and 
              right_paddle["y"] <= ball["y"] <= right_paddle["y"] + self.PADDLE_HEIGHT):
            # Calculer l'angle de rebond basé sur le point d'impact
            impact_point = (ball["y"] - right_paddle["y"]) / self.PADDLE_HEIGHT
            angle = 75 * (2 * impact_point - 1)  # Angle entre -75° et 75°
            
            # Maintenir une vitesse constante
            ball["speed_x"] = self.BALL_SPEED * math.cos(math.radians(angle))
            ball["speed_y"] = self.BALL_SPEED * math.sin(math.radians(angle))
            ball["speed_x"] = -abs(ball["speed_x"])  # Vers la gauche
            
            # Éviter que la balle ne reste coincée
            ball["x"] = 0.98 - ball["radius"]

    def calculate_angle(self, impact_point, max_angle):        
        return max_angle * (2 * impact_point - 1)

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def send_game_state(self, state):
        """Envoie l'état du jeu à tous les clients"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "game_update",
                "ball": state["ball"],
                "left_paddle": {
                    "y": state["left_paddle"]["y"],
                    "id": state["left_paddle"]["id"],
                    "score": state["left_paddle"]["score"],
                    "name": state["left_paddle"]["name"]
                },
                "right_paddle": {
                    "y": state["right_paddle"]["y"],
                    "id": state["right_paddle"]["id"],
                    "score": state["right_paddle"]["score"],
                    "name": state["right_paddle"]["name"]
                },
            },
        )

    def handle_paddle_collision(self, ball, is_left_paddle):
        """Gère la collision avec une raquette"""
        # Calculer l'angle de rebond
        angle = self.calculate_angle(0.5, 75)  # Impact au milieu par défaut
        total_speed = ((ball["speed_x"] ** 2 + ball["speed_y"] ** 2) ** 0.5)

        # Mettre à jour les vitesses
        ball["speed_x"] = min(max(-self.MAX_BALL_SPEED, 
                                 total_speed * math.cos(math.radians(angle))), 
                             self.MAX_BALL_SPEED)
        ball["speed_y"] = min(max(-self.MAX_BALL_SPEED, 
                                 total_speed * math.sin(math.radians(angle))), 
                             self.MAX_BALL_SPEED)

        # Inverser la direction en fonction de la raquette touchée
        if is_left_paddle:
            ball["speed_x"] = abs(ball["speed_x"])  # Vers la droite
        else:
            ball["speed_x"] = -abs(ball["speed_x"])  # Vers la gauche

    async def check_winner(self, state):
        """Vérifie si un joueur a gagné et met à jour la base de données"""
        left_score = state["left_paddle"]["score"]
        right_score = state["right_paddle"]["score"]
        
        if self.SAVE_GAME == False and (left_score >= self.MAX_SCORE or right_score >= self.MAX_SCORE):
            self.SAVE_GAME = True
            # Déterminer le gagnant
            winner_id = state["left_paddle"]["id"] if left_score > right_score else state["right_paddle"]["id"]
            
            # Créer l'entrée dans la base de données
            logging.warning(f"\033[91mleft score {left_score} - right score {right_score}\033[0m")
            await self.save_game_result(
                player1_id=state["left_paddle"]["id"],
                player2_id=state["right_paddle"]["id"],
                winner_id=winner_id,
                player1_score=left_score,
                player2_score=right_score
            )
            # Envoyer le message de fin de partie
            await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "game_over",
                        "winner_id": winner_id,
                        "final_score": {
                            "left": left_score,
                            "right": right_score
                        }
                    }
                )

            # Réinitialiser l'état du jeu
            self.reset_game_state()

    async def save_game_result(self, player1_id, player2_id, winner_id, player1_score, player2_score):
        """Sauvegarde le résultat de la partie dans la base de données"""
        logger.warning(f"\033[93mSaving game result with scores - Left: {player1_score}, Right: {player2_score}\033[0m")
        try:
            # Vérifier si une partie existe déjà pour ces joueurs dans cette room
            existing_game = await self.get_existing_game(
                room_name=self.room_name
            )

            if existing_game:
                # Mettre à jour la partie existante
                await self.update_game_entry(
                    game=existing_game,
                    winner_id=winner_id,
                    player1_score=player1_score,
                    player2_score=player2_score
                )
            else:
                # Créer une nouvelle partie
                player1 = await self.get_user(player1_id)
                player2 = await self.get_user(player2_id)
                winner = await self.get_user(winner_id)

                await self.create_game_entry(
                    room_name=self.room_name,
                    player1=player1,
                    player2=player2,
                    winner=winner,
                    player1_score=player1_score,
                    player2_score=player2_score
                )
        except Exception as e:
            logger.error(f"Error saving game result: {e}")


    @database_sync_to_async
    def get_existing_game(self, room_name):
        """Vérifie si une partie existe déjà"""
        try:
            return Game.objects.get(
                room_name=room_name,
            )
        except Game.DoesNotExist:
            return None

    @database_sync_to_async
    def update_game_entry(self, game, winner_id, player1_score, player2_score):
        """Met à jour une partie existante"""
        game.winner_id = winner_id
        game.player1_score = player1_score
        game.player2_score = player2_score
        game.save()

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def create_game_entry(self, **kwargs):
        Game.objects.create(**kwargs)

    def reset_game_state(self):
        """Réinitialise l'état du jeu après une partie"""
        if self.room_name in self.game_states:
            state = self.game_states[self.room_name]
            state["ball"]["speed_x"] = 0
            state["ball"]["speed_y"] = 0
            state["left_paddle"]["score"] = 0
            state["right_paddle"]["score"] = 0
            self.reset_ball(state["ball"])

    async def game_over(self, event):
        """Gère l'envoi du message de fin de partie aux clients"""
        await self.send(text_data=json.dumps(event))

    async def game_forfeit(self, event):
        """Envoie le message de forfait aux clients"""
        await self.send(text_data=json.dumps(event))