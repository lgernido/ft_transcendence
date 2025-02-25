from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.translation import activate
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth import authenticate, login, logout
from django.contrib.sessions.models import Session
from django.shortcuts import redirect
from django.http import JsonResponse
from django.http import HttpResponseForbidden
from django.utils.translation import gettext as _
import os
from itertools import chain
from django.shortcuts import get_object_or_404

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from users.models import Social, Profile
from .models import Game, Room
import json

import base64
import time
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist

import uuid

IP_HOST = os.getenv("IP_HOST")

import logging
logging = logging.getLogger(__name__)

@csrf_protect
@login_required
def store_colors(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        player1_color = data.get('player1Color')
        player2_color = data.get('player2Color')
        max_point = data.get('maxPoint')

        request.session['player1_color'] = player1_color
        request.session['player2_color'] = player2_color
        request.session['max_point'] = max_point

        return JsonResponse({'message': 'Colors and max point stored successfully'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def home(request):
    return render(request, 'index.html')

@csrf_protect
def log_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({'error': _('Username and password are required.')}, status=200)

            user = authenticate(request, username=username, password=password)

            error1 = _("Username or password invalid")

            if user is not None:
                login(request, user)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'error': _('Username or password invalid')}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=200)

@csrf_protect
def mypage(request):
    if request.path not in ['/login_with_42/', '/callback/']:
        if request.headers.get('X-Fetch-Request') == 'true':
            return render(request, 'partials/mypage.html')
        else:
            return redirect('/?next=/mypage/')
    
    return render(request, 'mypage.html')

@csrf_protect
@login_required
def lobby_private(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/lobby_private.html')
    else:
        return redirect('/?next=/lobby_private/')

@csrf_protect
@login_required
def lobby_public(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/lobby_public.html')
    else:
        return redirect('/?next=/lobby_public/')

@csrf_protect
@login_required
def lobby_tournament(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/lobby_tournament.html')
    else:
        return redirect('/?next=/lobby_tournament/')

@csrf_protect
def stats(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/stats.html')
    else:
        return redirect('/?next=/stats/')

@csrf_protect
def local(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/gameCustom.html')
    else:
        return redirect('/?next=/gameCustom/')

@csrf_protect
def tournament(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/tournament.html')
    else:
        return redirect('/?next=/tournament/')

@csrf_protect
def GameBot(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/gameBot.html')
    else:
        return redirect('/?next=/gameBot/')

@csrf_protect
@login_required
def chat(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/chat.html')
    else:
        return redirect('/?next=/chat/')

def connect(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/connect.html')
    else:
        return redirect('/?next=/connect/')

@csrf_protect
@login_required
def game(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/game.html')
    else:
        return redirect('/?next=/game/')

@csrf_protect
@login_required
def lobby(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/lobby.html')
    else:
        return redirect('/?next=/lobby/')

@csrf_protect
def amis(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/amis.html')
    else:
        return redirect('/?next=/amis/')
    

@csrf_protect
def compte(request):

    try:
        social = Social.objects.get(user=request.user)
    except Social.DoesNotExist:
        return JsonResponse({'error': _('Social profile not found.')}, status=404)

    if request.method == 'POST':
        
        try:
            user = request.user
            data = json.loads(request.body)

            email = data.get('email')
            username = data.get('username')
            password = data.get('password')
            new_avatar = data.get('avatar')

            if len(username) > 12:
                return JsonResponse({'error': _('Username too long')}, status=200)
            
            if not username or not email:
                return JsonResponse({'error': _('Username and email are required.')}, status=200)
            
            if User.objects.exclude(pk=request.user.pk).filter(username=username).exists():
                return JsonResponse({'error': _('Username already used')}, status=200)

            user.email = email
            user.username = username

            if new_avatar:
                current_avatar_name = social.avatar.url.split('/')[-1]  # Nom du fichier actuel de l'avatar
                new_avatar_name = new_avatar.split('/')[-1]  # Nom du fichier de l'avatar proposé

                if current_avatar_name != new_avatar_name:
                    # Vérification si l'avatar est une chaîne base64
                    if new_avatar.startswith('data:image'):
                        format, imgstr = new_avatar.split(';base64,')
                        ext = format.split('/')[1]
                        image_data = ContentFile(base64.b64decode(imgstr), name=f"{user.username}_avatar.{ext}")
                        social.update_avatar(image_data)
                    else:
                        # Si ce n'est pas base64, assumez qu'il s'agit d'une URL ou d'un chemin d'image
                        social.update_avatar(new_avatar)

            if password:
                user.set_password(password)
                user.save()
                update_session_auth_hash(request, user) 
                return JsonResponse({'success': True})
            
            user.save()
            return JsonResponse({'success': True})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error execption': str(e)}, status=400)
        
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/compte.html', {'user': request.user})
    else:
        return redirect('/?next=/compte/')


@csrf_protect
def header(request):
    return render(request, 'partials/header.html')

@csrf_protect
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'CSRF token missing or invalid'}, status=403)

def check_user_status(request):
    return JsonResponse({'authenticated': request.user.is_authenticated})

@csrf_protect
def set_language(request):
    if request.method == 'POST':
        lang = request.POST.get('language')
        if lang:
            activate(lang)
            request.session[LANGUAGE_SESSION_KEY] = lang
    return redirect(request.META.get('HTTP_REFERER', '/'))

def extractProfile(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'User ID is required'}, status=400)

    try:
        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user)
        data = {
            'games_win': profile.games_win,
            'games_lose': profile.games_lose,
            'games_draw': profile.games_draw,
        }
        return JsonResponse({'profile': data})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
def extractGame(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({'error': 'User ID is required'}, status=400)

    try:
        user = User.objects.get(id=user_id)

        games_as_player1 = Game.objects.filter(player1=user).order_by('-date_played')
        games_as_player2 = Game.objects.filter(player2=user).order_by('-date_played')

        all_games = sorted(
            chain(games_as_player1, games_as_player2),
            key=lambda game: game.date_played,
            reverse=True
        )

        games_data = []

        for game in all_games:
            opponent = game.player2 if game.player1 == user else game.player1

            avatar_url = (
                opponent.social.avatar.url
                if hasattr(opponent, 'social') and opponent.social.avatar.url
                else '/media/avatars/default_avatar.png'
            )
            games_data.append({
                "opponent": opponent.username,
                "opponentId": opponent.id,
                "user": user.username,
                "winner": game.winner.username if game.winner and game.winner != opponent else None,
                "player1_score": game.player1_score,
                "player1_name": game.player1.username,
                "player2_score": game.player2_score,
                "player2_name": game.player2.username,
                "date_played": game.date_played.isoformat(),
                "avatar": avatar_url,
            })

        return JsonResponse(games_data, safe=False)

    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

@login_required
def create_roomP(request):
    if request.method == 'POST':
        current_user = request.user

        try:
            current_room = Room.objects.filter(players=current_user).first()
            if current_room:
                room_name_in_session = request.session.get('roomName')
                if room_name_in_session and current_room.name != room_name_in_session:
                    return JsonResponse({
                        'error': f"You are already in a different room: {current_room.name}."
                    }, status=200)
            
            room = Room.objects.create()
            room.add_player(current_user)
            room.host = current_user
            room.privateRoom = True
            room.save()
            request.session['roomName'] = room.name
            request.session.save()

            return JsonResponse({
                'success': True, 
                'room_name': room.name,
            })
        except Exception as e:
            return JsonResponse({'error': f"An error occurred: {str(e)}"}, status=500)
    
    return JsonResponse({'error': 'Invalid method'}, status=405)

@login_required
def find_or_create_room(request):
    current_user = request.user

    room = Room.objects.filter(is_full=False, privateRoom=False).first()

    if room:
        added = room.add_player(current_user)
        if added:
            room.is_full = True
            room.save()
        else:
            return JsonResponse({"success": False, "error": "Room could not add player."}, status=200)
    else:
        room = Room.objects.create(
            host=current_user,
            privateRoom=False
        )
        room.add_player(current_user)
        room.save()
        request.session['roomName'] = room.name
        request.session.save()

    return JsonResponse({
        "success": True,
        "room_name": room.name,
    })


@login_required
def join_room(request, room_name):
    try:
        room = get_object_or_404(Room, name=room_name)
        
        request.session['roomName'] = room.name

        if room.add_player(request.user):
            if request.method == 'POST':
                return JsonResponse({"success": True, "message": "You joined the room."})
            elif request.method == 'GET':
                return render(request, 'partials/lobby_private.html')

        error_message = "Room is full"
        if request.method == 'POST':
            return JsonResponse({"success": False, "error": error_message})

    except Room.DoesNotExist:
        error_message = "Room not found"
        if request.method == 'POST':
            return JsonResponse({"success": False, "error": error_message})

    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        if request.method == 'POST':
            return JsonResponse({"success": False, "error": error_message})

@csrf_exempt
def get_room_status(request, room_name):
    try:
        room = Room.objects.get(name=room_name)
        return JsonResponse({'room_name': room.name, 'players': [player.username for player in room.players.all()]})
    except Room.DoesNotExist:
        return JsonResponse({'error': _('Room does not exist.')}, status=404)
    
def reset_room_session(request):
    if request.method == "POST":
        request.session['roomName'] = None
        return JsonResponse({"success": True, "message": "Session roomName réinitialisée."})
    return JsonResponse({"success": False, "message": "Méthode non autorisée."})

def delete_empty_rooms(request):
    try:
        rooms = Room.objects.all()

        deleted_rooms = []
        for room in rooms:
            if room.players.count() == 0:
                room.delete()
                deleted_rooms.append(room.name)

        return JsonResponse({'status': 'success', 'deleted_rooms': deleted_rooms})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)