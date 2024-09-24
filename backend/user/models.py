from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class User(models.Model):
    username=models.CharField(max_length=150, unique=True, blank=False)
    password=models.CharField(max_length=128, blank=False)
    email=models.CharField(max_length=120, blank=False)
    connected=models.BooleanField(default=False)

def set_password(self, initial_password):
    self.password=make_password(initial_password)

def check_password(self, initial_password):
    return check_password(initial_password, self.password)

def __str__(self):
    return self.username
