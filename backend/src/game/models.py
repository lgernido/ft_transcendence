from django.db import models
from django.contrib.auth.models import User
from users.models import Profile
import time
import random
    
class Game(models.Model):
    room_name = models.CharField(max_length=255, default="default_room")
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_player1")
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_player2")

    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won")
    
    player1_score = models.PositiveIntegerField(default=0)
    player2_score = models.PositiveIntegerField(default=0)

    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game between {self.player1.username} and {self.player2.username} - Winner: {self.winner.username if self.winner else 'Draw'}"
    
class Room(models.Model):
    name = models.CharField(max_length=50, unique=True)
    players = models.ManyToManyField(User, related_name='rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_rooms', null=True)
    privateRoom = models.BooleanField(default=False)
    points_limit = models.IntegerField(default=5)
    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)
    player1_color = models.CharField(max_length=50, default='color-player-default')
    player2_color = models.CharField(max_length=50, default='color-player-default')
    is_full = models.BooleanField(default=False)

    def add_player(self, user):
        if self.players.count() < 2:
            self.players.add(user)
            return True
        return False
    
    def save(self, *args, **kwargs):
        if not self.name:
            random_number = random.randint(100000, 999999)
            self.name = f"room_{random_number}_{int(time.time())}"
        super().save(*args, **kwargs)
