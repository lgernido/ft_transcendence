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

def update_avatar_from_42_api(user_info, social):
    img_data = user_info['image']['link']  # L'URL de l'image
    response = requests.get(img_data)
    response.raise_for_status()  # Vérifie les erreurs HTTP

    filename = os.path.basename(img_data)
    image_file = ContentFile(response.content, name=filename)
    
    social.avatar = image_file
    social.save(update_fields=['avatar'])
    social.refresh_from_db()

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
        else:
            social2 = Social.objects.get(user=user)
            if social2.user42 == False:
                return redirect('/connect')
            

        if not request.user.is_authenticated:
            dj_login(request, user)
            user = request.user
            social = Social.objects.get(user=user)
            if (social.avatar.name).split('/')[-1] == "default_avatar.png":
                update_avatar_from_42_api(user_info, social)

        social.user42 = True
        social.save(update_fields=['user42'])

        request.session['access_token'] = access_token
        request.session.save()

        return redirect('/mypage')
    return HttpResponse('Authorization failed.', status=401)
