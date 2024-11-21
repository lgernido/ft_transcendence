from authlib.integrations.django_client import OAuth
from django.shortcuts import redirect
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

def login(request):    
    redirect_uri = REDIRECT_URL
    client = oauth.create_client('42')
    return client.authorize_redirect(request, redirect_uri)

def callback(request):
    client = oauth.create_client('42')
    token = client.authorize_access_token()
    if token:
        access_token = token['access_token']
        request.session['access_token'] = access_token
        return HttpResponse(f'Token: {access_token}')
    else:
        return HttpResponse('Authorization failed.')
