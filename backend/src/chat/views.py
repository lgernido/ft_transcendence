from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib import messages
from .models import Channel, Message
from django.contrib.auth.models import User

import sys

def index(request):
    return render(request, 'chat/chat-room.html')


def search_users(request):
    query = request.GET.get('query', '')
    print(query)
    sys.stdout.flush()
    if len(query) >= 2:
        users = User.objects.filter(username__icontains=query)
        results = [{'username': user.username, 'channel_id': user.id} for user in users]
        print(results)
        sys.stdout.flush()
        return JsonResponse({'results': results})
    return JsonResponse({'results': []})