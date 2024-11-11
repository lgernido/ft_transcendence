# views.py
from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .models import Channel
import os

User = get_user_model()
def index(request):
    return render(request, 'chat/chat-room.html')

# Dans le cas ou cela ne fonctionne pas regarder si les routes sont ou urls sont bonne
def search_users(request):
    query = request.GET.get('query', '')
    if len(query) >= 2:
        users = User.objects.filter(username__icontains=query)
        results = [{'username': user.username, 'id': user.id} for user in users]
        return JsonResponse({'results': results})
    return JsonResponse({'results': []})

def create_private_channel(request, user_id):
    other_user = get_object_or_404(User, id=user_id)
    user = request.user
    
    # Vérifier si le canal privé existe déjà
    channel, created = Channel.objects.get_or_create(
        mode=1,  # Mode 'Private message'
        users__in=[user],
    )
    # Si le canal vient d'être créé, ajouter les utilisateurs
    if created:
        channel.users.add(user, other_user)
    
    return JsonResponse({'channel_id': channel.id})
