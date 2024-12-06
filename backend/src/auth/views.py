from django.contrib.auth import login as dj_login
from authlib.integrations.django_client import OAuth
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.http import HttpResponse
import os
from dotenv import load_dotenv
from game.models import Profile
from users.models import Social
from django.core.files.base import ContentFile
import requests
import base64

load_dotenv()

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URL = os.getenv('REDIRECT_URL')

oauth = OAuth()
oauth.register(
    name='42',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    access_token_url='https://api.intra.42.fr/oauth/token',
    authorize_url='https://api.intra.42.fr/oauth/authorize',
    api_base_url='https://api.intra.42.fr/v2/',
    client_kwargs={'scope': 'public'},
)

def login_with_42(request):
    redirect_uri = REDIRECT_URL
    client = oauth.create_client('42')
    return client.authorize_redirect(request, redirect_uri)

import logging
logger = logging.getLogger(__name__)

def update_avatar_from_42_api(user_info, user):
    img_data = user_info['image']['link']  # L'URL de l'image
    response = requests.get(img_data)
    response.raise_for_status()  # Vérifie les erreurs HTTP

    filename = os.path.basename(img_data)
    image_file = ContentFile(response.content, name=filename)
    
    social = Social.objects.get(user=user)
    social.avatar = image_file
    social.save()
    
    social.refresh_from_db()
    logging.warning(f"\nAvatar URL after update: {social.avatar.url}\n")

def callback(request):
    client = oauth.create_client('42')
    token = client.authorize_access_token(request)

    if token:
        access_token = token['access_token']
        user_info = client.get('https://api.intra.42.fr/v2/me', token=token).json()

        user = User.objects.filter(username=user_info['login']).first()

        if user is None:
            user = User.objects.create_user(
                username=user_info['login'],
                email=user_info.get('email', ''),
                password='',
            )
            profile = Profile.objects.create(user=user)
            profile.save()
            update_avatar_from_42_api(user_info, user)

        if not request.user.is_authenticated:
            dj_login(request, user)

        request.session['access_token'] = access_token
        request.session.save()

        return redirect('/mypage')

    return HttpResponse('Authorization failed.', status=401)

# def callback(request):
#     client = oauth.create_client('42')
#     token = client.authorize_access_token(request)
#     if token:
#         access_token = token['access_token']
#         request.session['access_token'] = access_token
#         return HttpResponse(f'Token: {access_token}')
#     else:
#         return HttpResponse('Authorization failed.')logger = logging.getLogger(name)