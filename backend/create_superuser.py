import os
import sys
import secrets

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

import django
django.setup()

def get_random_secret_key():
    return secrets.token_urlsafe(16)
from django.conf import settings
from django.contrib.auth.management.commands.createsuperuser import get_default_username
from django.contrib.auth.models import User

def create_superuser(username, email, password):
    from django.contrib.auth.models import User

    if User.objects.filter(username=username).exists():
        print(f"The superuser {username} already exists")
        return

    
    user_data = {
        'username': username,
        'email': email,
        'password': password
    }
    user = User.objects.create_superuser(**user_data)
    user.save()

    print(f"The superuser {username} has successfully been created.")

if __name__ == "__main__":
    username = os.getenv("SUPERUSER_USERNAME", "admin")
    email = os.getenv("SUPERUSER_EMAIL", "admin@example.com")
    password = os.getenv("SUPERUSER_PASSWORD", get_random_secret_key())

    create_superuser(username, email, password)