from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib import messages
from .models import Channel, Message

User = get_user_model()

def start_private_chat(request, recipient_username):
    return render(request, 'chat/test-chat.html', {"recipient_username": recipient_username})