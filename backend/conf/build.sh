#!/bin/bash
# Script de démarrage pour Django

echo "Appliquer les migrations..."
  python src/manage.py makemigrations
python src/manage.py migrate
python src/manage.py collectstatic

echo "Créer un super utilisateur..."
python src/manage.py shell -c "
from django.contrib.auth import get_user_model;
import os;
User = get_user_model();
username = os.environ.get('DJANGO_SUPERUSER_USERNAME');
email = os.environ.get('DJANGO_SUPERUSER_EMAIL');
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD');
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password);
"

echo "Créer 10 utilisateurs..."
python src/manage.py shell -c "
from django.contrib.auth import get_user_model
from users.models import Profile  # Assurez-vous de remplacer 'your_app' par le nom de votre application
User = get_user_model()

# Liste des noms d'utilisateur
users = ['sam', 'bob', 'coc', 'she', 'luc', 'dil', 'oce', 'kyks', 'oxt', 'tho']

# Création des utilisateurs et de leurs profils
for username in users:
    email = f'{username}@{username}.fr'
    password = '123'
    
    # Vérifier si l'utilisateur existe déjà
    if not User.objects.filter(username=username).exists():
        # Créer l'utilisateur
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Créer un profil pour l'utilisateur
        profile = Profile.objects.create(user=user)
        
        # (Optionnel) Vous pouvez ajouter des amis ou des utilisateurs bloqués ici si nécessaire
        # Exemple : 
        # profile.friends_user.add(some_other_user)
        
        print(f'Utilisateur {username} et son profil créé avec succès.')

"

echo "Lancer le serveur Django..."
exec "$@"