from django.contrib.auth import login as dj_login, logout
from authlib.integrations.django_client import OAuth
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from django.http import HttpResponse, JsonResponse
import os
from dotenv import load_dotenv
from game.models import Profile
from django.contrib.sessions.models import Session

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

import logging
logger = logging.getLogger('yourapp')

def login_with_42(request):
    logger.debug("login with 42 function called.")
    redirect_uri = REDIRECT_URL
    client = oauth.create_client('42')
    return client.authorize_redirect(request, redirect_uri)


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

        if not request.user.is_authenticated:
            dj_login(request, user)

        request.session['access_token'] = access_token
        request.session.save()

        return redirect('/mypage')

    return HttpResponse('Authorization failed.', status=401)