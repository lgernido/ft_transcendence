from django.contrib.auth import login
from authlib.integrations.django_client import OAuth
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.http import HttpResponse
import os
from dotenv import load_dotenv

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

def callback(request):
    client = oauth.create_client('42')

    token = client.authorize_access_token()
    if token:
        access_token = token['access_token']

        user_info = client.get('https://api.intra.42.fr/v2/me', token=token).json()

        user, created = User.objects.get_or_create(
            username=user_info['login'],
            defaults={
                'first_name': user_info.get('first_name', ''),
                'last_name': user_info.get('last_name', ''),
                'email': user_info.get('email', '')
            }
        )

        if not request.user.is_authenticated:
            login(request, user)

        request.session['access_token'] = access_token

        if request.user.is_authenticated:
            print(f"User {request.user.username} is authenticated")
            return render(request, 'partials/mypage.html')
        else:
            print("Authentication failed")
            return HttpResponse('Authentication failed.', status=401)
    else:
        return HttpResponse('Authorization failed.', status=401)
