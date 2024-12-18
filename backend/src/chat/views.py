from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from .models import Channel, Message
from users.models import Social
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User

import logging
logger = logging.getLogger(__name__)

User = get_user_model()

@sync_to_async
def get_messages_for_channel(channel_id):
    try:
        channel = Channel.objects.get(unique_identifier=channel_id)
        messages = channel.messages.order_by('timestamp').values('sender__username', 'content', 'timestamp')
        return list(messages)
    except Channel.DoesNotExist:
        return []

@sync_to_async
def get_user_id(request):
    return str(request.user.id)

@sync_to_async
def get_channel_name(channel_id, user_id_str):
    if not channel_id.isdigit():
        return channel_id
    if channel_id > user_id_str:
        channel_id = f"private_{user_id_str}-{channel_id}"
    else:
        channel_id = f"private_{channel_id}-{user_id_str}"
    return channel_id
  

async def load_messages(request):
    channel_id = request.GET.get('query', '')
    user_id_str = await get_user_id(request)
    
    channel_id = await get_channel_name(channel_id, user_id_str)
    try:
        messages_data = await get_messages_for_channel(channel_id)
        return JsonResponse({'messages': messages_data})
    except ObjectDoesNotExist:
        return JsonResponse({'messages': channel_id})

def get_current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({'current_user': request.user.username})
    else:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    
def search_users(request):
    query = request.GET.get('query', '')
    if len(query) >= 1:
        current_user = request.user
        
        # Recherche des utilisateurs correspondants
        if query == 'all':
            users = set()
            channels = Channel.objects.filter(users=current_user)
            for channel in channels:
                if channel.messages.exists():
                    other_users = channel.users.exclude(id=current_user.id, is_staff=False)
                    users.update(other_users)
        else:
            users = User.objects.filter(username__icontains=query, is_staff=False).exclude(id=current_user.id)
        
        results = []
        blocked_by_others = User.objects.filter(social__blocked_user=current_user) |  User.objects.filter(id=current_user.id)
        users = User.objects.filter(is_staff=False).exclude(id__in=blocked_by_others.values_list('id', flat=True))
        only_none_block = users.filter(username__icontains=query)
        for user in only_none_block:
            # Générer l'identifiant unique pour le canal
            user1_id, user2_id = sorted([current_user.id, user.id])
            unique_identifier = f"private_{user1_id}-{user2_id}"

            # Rechercher le canal correspondant
            channel = Channel.objects.filter(unique_identifier=unique_identifier, mode=1).first()

            if channel:
                # Récupérer le dernier message via une sous-requête ou directement
                last_message = channel.messages.order_by('-timestamp').first()
                results.append({
                    'avatar': user.social.avatar.url,
                    'username': user.username,
                    'id': user.id,
                    'last_message': last_message.content if last_message else 'Aucun message',
                    'last_message_timestamp': last_message.timestamp.isoformat() if last_message else None
                })
            else:
                # Pas de canal trouvé
                results.append({
                    'avatar': user.social.avatar.url,
                    'username': user.username,
                    'id': user.id,
                    'last_message': 'Aucun message',
                    'last_message_timestamp': None
                })

        results.sort(key=lambda x: x['last_message_timestamp'] or 0, reverse=True)
        return JsonResponse({'results': results})
    return JsonResponse({'results': []})


def user_conversations(request):
    user = request.user
    # Récupérer tous les channels où l'utilisateur est présent
    channels = Channel.objects.filter(users=user)

    conversations = []
    for channel in channels:
        last_message = channel.last_message
        if last_message:
            # Identifier les autres utilisateurs dans le channel (exclure l'utilisateur courant)
            other_users = channel.users.exclude(id=user.id)
            other_users_data = [{'id': u.id, 'username': u.username} for u in other_users]

            conversations.append({
                'channel_id': channel.id,
                'channel_name': channel.name,
                'participants': other_users_data,
                'last_message': {
                    'sender': last_message.sender.username,
                    'content': last_message.content,
                    'timestamp': last_message.timestamp.isoformat(),
                    'is_read': user in last_message.is_read_by.all()
                }
            })

    return JsonResponse({'conversations': conversations}, safe=False)