from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from .models import Channel, Message
from django.core.exceptions import ObjectDoesNotExist

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
        users = User.objects.filter(username__icontains=query, is_staff=False).exclude(id=current_user.id)
        results = []
        for user in users:
            user1_id, user2_id = sorted([current_user.id, user.id])
            unique_identifier = f"{user1_id}:{user2_id}"

            # Rechercher ou créer le canal avec `unique_identifier` pour les messages privés
            channel = Channel.objects.filter(unique_identifier=unique_identifier, mode=1).first()

            last_message = None
            if channel:
                last_message = channel.last_message  # Récupère le dernier message

            results.append({
                'username': user.username,
                'id': user.id,
                'last_message': last_message.content if last_message else 'Aucun message',
                'last_message_timestamp': last_message.timestamp.isoformat() if last_message else None
            })
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