#!/bin/bash
# Script de démarrage pour Django

echo "Appliquer les migrations..."
python src/manage.py migrate #--noinput
python src/manage.py makemigrations #--noinput

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


echo "Lancer le serveur Django..."
exec "$@"