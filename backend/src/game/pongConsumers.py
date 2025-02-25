import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import math
import random
from django.contrib.auth.models import User
from game.models import Game
from users.models import Profile
from channels.db import database_sync_to_async

import logging
logging = logging.getLogger(__name__)

class PongConsumer(AsyncWebsocketConsumer):
    # Dictionnaire pour stocker les états de jeu par room
    game_states = {}
    
    # Constantes de jeu
    PADDLE_SPEED = 0.02  # Vitesse des raquettes
    BALL_SPEED = 0.01    # Vitesse constante de la balle
    PADDLE_HEIGHT = 0.2  # Hauteur des raquettes
    FPS = 60  # Taux de rafraîchissement
    FRAME_TIME = 1.0 / FPS  # Temps entre chaque frame

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.his_color = self.scope['url_route']['kwargs']['his_color']
        self.score_limit = int(self.scope['url_route']['kwargs']['score_limit'])
        self.his_hote = int(self.scope['url_route']['kwargs']['his_hote'])
        self.user = self.scope["user"]
        self.room_group_name = f"pong_{self.room_name}"

        self.is_ball_resetting = False  # Ajout d'un flag pour vérifier l'état de la balle
        self.reset_time = 0  # Temps du dernier reset

        # Ajouter le joueur au groupe
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Initialiser l'état du jeu pour cette room s'il n'existe pas encore
        if self.room_name not in self.game_states:
            self.game_states[self.room_name] = {
                "score_limit": None,
                "save_game": False,
                "ball": {"radius":0.01, "x": 0.5, "y": 0.5, "speed_x": 0, "speed_y": 0},
                "left_paddle": {"y": 0.45, "id": None, "score": 0, "name": "", "color":""},
                "right_paddle": {"y": 0.45, "id": None, "score": 0, "name": "", "color":""},
                "connected_players": 0,
            }

        # Augmenter le compteur de joueurs connectés pour cette room
        self.game_states[self.room_name]["connected_players"] += 1

        # Assigner l'utilisateur à une raquette
        game_state = self.game_states[self.room_name]
        # l'hote 
        if self.his_hote:
            game_state["left_paddle"]["id"] = self.user.id
            game_state["left_paddle"]["name"] = self.user.username[:8]
            game_state["left_paddle"]["color"] = self.his_color
            game_state["score_limit"] = self.score_limit
        # le guest
        else:
            game_state["right_paddle"]["id"] = self.user.id
            game_state["right_paddle"]["name"] = self.user.username[:8]
            game_state["right_paddle"]["color"] = self.his_color
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
                        "color": game_state["left_paddle"]["color"],
                        "name": game_state["left_paddle"]["name"],
                    },
                    "right_paddle": {
                        "id": game_state["right_paddle"]["id"],
                        "color": game_state["right_paddle"]["color"],
                        "name": game_state["right_paddle"]["name"],
                    },
                },
            )
            asyncio.create_task(self.game_loop())


    async def disconnect(self, close_code):
        """Gestion de la déconnexion d'un joueur"""
        
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
            if state["save_game"] == False and (state["connected_players"] == 2):
                try:
                    await self.save_game_result(
                        player1_id=state["left_paddle"]["id"],
                        player2_id=state["right_paddle"]["id"],
                        winner_id=winner_id,
                        player1_score=state["left_paddle"]["score"],
                        player2_score=state["right_paddle"]["score"]
                    )
                except Exception as e:
                    print(f"Error saving game result on disconnect: {e}")

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
            if self.room_name in self.game_states:
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
        game_started = False  # Drapeau pour indiquer si le jeu a démarré

        while True:
            current_time = asyncio.get_event_loop().time()
            delta_time = current_time - last_update

            if delta_time >= self.FRAME_TIME and self.room_name in self.game_states:
                state = self.game_states[self.room_name]
                ball = state["ball"]

                if not game_started:  # Lancement initial
                    game_started = True
                    await asyncio.sleep(3)  # Attente supplémentaire avant le premier mouvement
                    self.reset_ball(state["ball"])

                if self.is_ball_resetting:
                    if current_time - self.reset_time >= 1:
                        self.is_ball_resetting = False

                if not self.is_ball_resetting:
                    if ball["speed_x"] != 0 and ball["speed_y"] != 0:
                        ball["x"] += ball["speed_x"] * delta_time * self.FPS
                        ball["y"] += ball["speed_y"] * delta_time * self.FPS

                    ball["y"] = max(0.02 + ball["radius"], min(0.98 - ball["radius"], ball["y"]))

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

        self.BALL_SPEED = 0.01
        self.is_ball_resetting = True
        self.reset_time = asyncio.get_event_loop().time()
        # Direction aléatoire mais vitesse constante
        angle = random.uniform(-30, 30)
        num = random.randint(-1, 1)
        if num == 0:
            num = -1
        ball["speed_x"] = num * self.BALL_SPEED * math.cos(math.radians(angle))
        ball["speed_y"] = self.BALL_SPEED * math.sin(math.radians(angle))

    async def handle_collisions(self, state, ball):
        # Collision avec les murs
        if ball["y"] - ball["radius"] <= 0.02:  # Collision avec le mur du haut
            ball["y"] = 0.02 + ball["radius"]  # Réinitialiser la position juste en dessous du mur
            ball["speed_y"] *= -1  # Inverser la direction Y

        elif ball["y"] + ball["radius"] >= 0.98:  # Collision avec le mur du bas
            ball["y"] = 0.98 - ball["radius"]  # Réinitialiser la position juste au-dessus du mur
            ball["speed_y"] *= -1  # Inverser la direction Y

        # Collision avec les raquettes
        left_paddle = state["left_paddle"]
        right_paddle = state["right_paddle"]
        
        # Collision avec la raquette gauche
        if (ball["x"] - ball["radius"] <= 0.02 and 
            left_paddle["y"] <= ball["y"] <= left_paddle["y"] + self.PADDLE_HEIGHT):
            # Calculer l'angle de rebond basé sur le point d'impact
            impact_point = (ball["y"] - left_paddle["y"]) / self.PADDLE_HEIGHT
            angle = 75 * (2 * impact_point - 1)  # Angle entre -75° et 75°

            if self.BALL_SPEED < 0.037:
                self.BALL_SPEED *= 1.05

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
            
            if self.BALL_SPEED < 0.037:
                self.BALL_SPEED *= 1.05

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

    async def set_value(self, event):
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
                    "name": state["left_paddle"]["name"],
                },
                "right_paddle": {
                    "y": state["right_paddle"]["y"],
                    "id": state["right_paddle"]["id"],
                    "score": state["right_paddle"]["score"],
                    "name": state["right_paddle"]["name"],
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
        
        if state["save_game"] == False and (left_score >= state["score_limit"] or right_score >= state["score_limit"]):
            state["save_game"] = True
            # Déterminer le gagnant
            winner_id = state["left_paddle"]["id"] if left_score > right_score else state["right_paddle"]["id"]

            
            # Créer l'entrée dans la base de données
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
                draw = player1_score == player2_score
                    
                await self.update_stats(player1, player2, winner, draw)
        except Exception as e:
            print(f"Error saving game result: {e}")


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

    @database_sync_to_async
    def update_stats(self, player1, player2, winner, draw):
        profileP1 = Profile.objects.get(user=player1)
        profileP1.games_played += 1
        profileP2 = Profile.objects.get(user=player2)
        profileP2.games_played += 1
        if (draw):
            profileP1.games_draw += 1
            profileP2.games_draw += 1
        elif (winner.id == profileP1.user.id):
            profileP1.games_win += 1
            profileP2.games_lose += 1
        else:
            profileP1.games_lose += 1
            profileP2.games_win += 1

        profileP1.save()
        profileP2.save()