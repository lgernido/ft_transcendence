from django.shortcuts import render, redirect
from pyoauth2 import Client
from django.http import HttpResponse
import os
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URL = os.getenv('REDIRECT_URL')

client = Client(CLIENT_ID, CLIENT_SECRET, 
                site='https://api.intra.42.fr',
                authorize_url='/oauth/authorize',
                token_url='/oauth/access_token')

def login(request):
    authorize_url = client.auth_code.authorize_url(redirect_uri=REDIRECT_URL)
    return redirect(authorize_url)


def callback(request):
    code = request.GET.get('code')
    if code:
        access_token = client.auth_code.get_token(code, redirect_uri=REDIRECT_URL)
        return HttpResponse(f'Token: {access_token.params}')
    else:
        return HttpResponse('Authorization failed.')
