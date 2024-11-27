from django.db import models
from django.contrib.auth.models import User
from users.models import Profile
    
class Game(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_player1")
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_player2")

    winner = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won",
    )
    
    player1_score = models.PositiveIntegerField(default=0)
    player2_score = models.PositiveIntegerField(default=0)

    date_played = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(blank=True, null=True)

    def __str__(self):
        return f"Game between {self.player1.username} and {self.player2.username} - Winner: {self.winner.username if self.winner else 'Draw'}"

