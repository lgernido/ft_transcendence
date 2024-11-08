from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.


class Channel(models.Model):
    CHANNEL_TYPE = [
        (1, 'Private message'),
        (2, 'Public'),
        (3, 'Party'),
    ]
    
    id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    mode = models.IntegerField(choices=CHANNEL_TYPE)
    users = models.ManyToManyField(User, related_name='channels')
    created_at = models.DateTimeField(auto_now_add=True)

    
    def is_user_allowed(self, user):
        if self.mode == 1:  # Private message
            return self.users.count() == 2 and user in self.users.all()   
        if self.mode == 2:  # Public
            return True
        if self.mode == 3:  # Party
            return user in self.users.all()
        return False
    
    def __str__(self):
        return self.name

class Message(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages')  # Canal du message
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')  # Utilisateur qui envoie le message
    content = models.TextField()  # Contenu du message
    timestamp = models.DateTimeField(auto_now_add=True)  # Heure d'envoi du message
    is_read = models.BooleanField(default=False)  # Indicateur de lecture du message

    def __str__(self):
        return f"Message de {self.sender.username} dans {self.channel.name}: {self.content[:20]}..."
