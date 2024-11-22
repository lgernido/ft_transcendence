from django.db import models
from django.contrib.auth.models import User

# Gestion des stats
class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    games_played = models.PositiveIntegerField(default=0)
    games_win = models.PositiveIntegerField(default=0)
    games_lose = models.PositiveIntegerField(default=0)
    games_draw = models.PositiveIntegerField(default=0)
    

# Gestion des relations sociale
class Social(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    friends_user = models.ManyToManyField(User, related_name='friends', blank=True)
    blocked_user = models.ManyToManyField(User, related_name='blocked_by', blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

    def add_friend(self, other_user):
        if other_user not in self.friends_user.all():
            self.friends_user.add(other_user)
            self.save()

    def remove_friend(self, other_user):
        if other_user in self.friends_user.all():
            self.friends_user.remove(other_user)
            self.save()

    def block_user(self, other_user):
        if other_user not in self.blocked_user.all():
            self.blocked_user.add(other_user)
            # self.remove_friend(other_user)
            self.save()

    def unblock_user(self, other_user):
        if other_user in self.blocked_user.all():
            self.blocked_user.remove(other_user)
            self.save()

    def get_contacts(self):
        return self.friends_user.all()

    def get_blocked_users(self):
        return self.blocked_user.all()



