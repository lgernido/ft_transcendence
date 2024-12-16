from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import time
import os
import logging

# Gestion des stats
class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    games_played = models.PositiveIntegerField(default=0)
    games_win = models.PositiveIntegerField(default=0)
    games_lose = models.PositiveIntegerField(default=0)
    games_draw = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s Stats"

    
def avatar_upload_to(instance, filename):
    timestamp = str(int(time.time()))
    return f'avatars/{instance.user.id}_{timestamp}_avatar.{filename.split(".")[-1]}'

# Gestion des relations sociales et avatar
class Social(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='social')
    avatar = models.ImageField(
        upload_to=avatar_upload_to,
        default='avatars/default_avatar.png',
        blank=True
    )
    friends_user = models.ManyToManyField(User, related_name='friends', blank=True)
    blocked_user = models.ManyToManyField(User, related_name='blocked_by', blank=True)

    def __str__(self):
        return f"{self.user.username}'s Social"

    # Gestion des amis
    def add_friend(self, other_user):
        # if other_user not in self.friends_user.all().username:
        self.friends_user.add(other_user.user)

    def remove_friend(self, other_user):
        # if other_user in self.friends_user.all():
        self.friends_user.remove(other_user.user)

    def block_user(self, other_user):
        # if other_user not in self.blocked_user.all():
        self.blocked_user.add(other_user.user)
        self.friends_user.remove(other_user.user)  # Supprime des amis si bloqué

    def unblock_user(self, other_user):
    # Vérifier si l'ID de other_user est présent dans blocked_by
        # if other_user in self.blocked_user.all():
            self.blocked_user.remove(other_user.user)
            # logging.info(f"L'utilisateur {other_user} a été débloqué.")
        # else:
            # logging.warning(f"L'utilisateur {other_user} n'est pas bloqué.")


    import logging
    logger = logging.getLogger(__name__)

    def update_avatar(self, new_avatar):
        if self.avatar and self.avatar != 'avatars/default_avatar.png':
            try:
                avatar_path = os.path.join(settings.MEDIA_ROOT, self.avatar.name)
                if os.path.isfile(avatar_path):
                    os.remove(avatar_path)
            except Exception as e:
                 logging.warning("\nERROR UPDATE AVATAR\n", e)
        if new_avatar.startswith("http"):
            parts = new_avatar.split('/')
            if len(parts) > 2:
                new_avatar = '/'.join(parts[-2:])
        new_avatar = new_avatar
        logging.warning("self avatar: ", self.avatar)
        logging.warning("new_avatar: ", new_avatar)
        self.avatar = new_avatar
        self.save()


# Signaux pour gérer la création automatique des profils
@receiver(post_save, sender=User)
def create_user_profiles(sender, instance, created, **kwargs):
    if created:
        Social.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profiles(sender, instance, **kwargs):
    instance.social.save()
