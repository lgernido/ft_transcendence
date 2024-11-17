from django.db import models
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

User = get_user_model()

class Channel(models.Model):
    CHANNEL_TYPE = [
        (1, 'Private message'),
        (2, 'Public'),
        (3, 'Party'),
    ]
    
    id = models.AutoField(primary_key=True, unique=True)
    unique_identifier = models.CharField(max_length=255, unique=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    mode = models.IntegerField(choices=CHANNEL_TYPE)
    users = models.ManyToManyField(User, related_name='channels')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def last_message(self):
        return self.messages.order_by('-timestamp').first()
    
    @property
    @sync_to_async
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
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read_by = models.ManyToManyField(User, related_name='read_messages', blank=True)  # Pour plusieurs utilisateurs
    
    class Meta:
        indexes = [
            models.Index(fields=['channel', 'timestamp']),
        ]

    def __str__(self):
        return f"Message de {self.sender.username} dans {self.channel.name}: {self.content[:20]}..."


