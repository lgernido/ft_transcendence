from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.translation import activate
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth import authenticate, login, logout
from django.contrib.sessions.models import Session
from django.shortcuts import redirect
from django.http import JsonResponse
from django.http import HttpResponseForbidden

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Game
from users.models import Social, Profile
from .models import Game
import json

import base64
import time
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist

import logging
logger = logging.getLogger(__name__)
import uuid
import logging

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
                return JsonResponse({'error': 'Username and password are required.'}, status=400)

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'error': 'Username or password invalid'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    return render(request, 'partials/connect.html')

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
        return redirect('/?next=/lobby_Pr/')

@csrf_protect
@login_required
def lobby_tournament(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/lobby_tournament.html')
    else:
        return redirect('/?next=/lobby_T/')

@csrf_protect
def stats(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/stats.html')
    else:
        return redirect('/?next=/stats/')

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
    player1_color = request.session.get('player1_color', 'color-player-none')
    player2_color = request.session.get('player2_color', 'color-player-none')
    max_point = request.session.get('max_point', 10)

    if request.method == "POST":
        player1_id = request.POST.get('player1_id')
        player2_id = request.POST.get('player2_id')
        player1_score = int(request.POST.get('player1_score', 0))
        player2_score = int(request.POST.get('player2_score', 0))

        player1 = User.objects.get(id=player1_id)
        player2 = User.objects.get(id=player2_id)

        if player1_score >= max_point:
            winner = player1
        elif player2_score >= max_point:
            winner = player2
        else:
            winner = None

        game = Game.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            player1_score=player1_score,
            player2_score=player2_score
        )
        return JsonResponse({'status': 'success', 'message': 'Game updated successfully'})

    return render(request, 'partials/game.html', {
        'player1_color': player1_color,
        'player2_color': player2_color,
        'max_point': max_point
    })

@csrf_protect
@login_required
def lobby(request):
    if request.headers.get('X-Fetch-Request') == 'true':
        return render(request, 'partials/lobby.html')
    else:
        return redirect('/?next=/lobby_Pu/')

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
        return JsonResponse({'error': 'Social profile not found.'}, status=404)

    if request.method == 'POST':
        
        try:
            user = request.user
            data = json.loads(request.body)

            email = data.get('email')
            username = data.get('username')
            password = data.get('password')
            new_avatar = data.get('avatar')
            

            if not username or not email:
                return JsonResponse({'error': 'Username and email are required.'}, status=400)
            
            if User.objects.exclude(pk=request.user.pk).filter(username=username).exists():
                return JsonResponse({'error': 'Username already used'}, status=400)

            user.email = email
            user.username = username

            if new_avatar:
                current_avatar_name = social.avatar.url.split('/')[-1]  # Nom du fichier actuel de l'avatar
                new_avatar_name = new_avatar.split('/')[-1]  # Nom du fichier de l'avatar proposé
                logging.warning("NEW avatar: ", current_avatar_name, " ", new_avatar_name, new_avatar)

                if current_avatar_name != new_avatar_name:
                    # logging.warning("Avatar name: ", new_avatar_name, " ", current_avatar_name)
                    # Vérification si l'avatar est une chaîne base64
                    if new_avatar.startswith('data:image'):
                        format, imgstr = new_avatar.split(';base64,')
                        ext = format.split('/')[1]
                        image_data = ContentFile(base64.b64decode(imgstr), name=f"{user.username}_avatar.{ext}")
                        logging.warning("Different", image_data)
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

        games_as_player1 = Game.objects.filter(player1=user)
        games_as_player2 = Game.objects.filter(player2=user)

        games_data = []

        for game in games_as_player1.union(games_as_player2):
            opponent = game.player2 if game.player1 == user else game.player1

            avatar_url = (
                opponent.social.avatar.url
                if hasattr(opponent, 'social') and opponent.social.avatar.url
                else '/media/avatars/default_avatar.png'
            )
            games_data.append({
                "opponent": opponent.username,
                "winner": game.winner.username if game.winner.username != opponent.username else None,
                "player1_score": game.player1_score,
                "player2_score": game.player2_score,
                "date_played": game.date_played.isoformat(),
                "opponentId": opponent.id,
                "avatar": avatar_url,
            })

        return JsonResponse(games_data, safe=False)

    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


    return redirect(request.META.get('HTTP_REFERER', '/')) 

@csrf_exempt
def game_results(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            player_left_name = data.get('playerLeft')
            player_right_name = data.get('playerRight')
            winner_name = data.get('winner')
            left_score = data.get('leftScore')
            right_score = data.get('rightScore')

            user=User.objects.get(username=player_left_name)
            profile = Profile.objects.get(user=user)
            profile.games_played += 1
            if winner_name == player_left_name:
                profile.games_win += 1
            else:
                profile.games_lose += 1
            
            profile.save()

            game = Game.objects.create(
                player1=user,
                player2=User.objects.get(username="invite"),
                winner=user if winner_name == player_left_name else User.objects.get(username="invite"),
                player1_score=left_score,
                player2_score=right_score,
                date_played=time.strftime('%Y-%m-%d %H:%M:%S')
            )

            return JsonResponse({'message': 'Game results saved successfully'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

logger = logging.getLogger(__name__)

@csrf_protect
@login_required
def create_dynamic_room(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)

        room_name = data.get('roomName')
        player1_color = data.get('player1Color')
        player2_color = data.get('player2Color')
        max_point = data.get('maxPoint')

        if not all([room_name, player1_color, player2_color, max_point]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        request.session['player1_color'] = player1_color
        request.session['player2_color'] = player2_color
        request.session['max_point'] = max_point

        return JsonResponse({'redirect': True, 'url': f'/dynamic_game/{room_name}/'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_protect
@login_required
def dynamic_game_room(request, room_name):
    player1_color = request.session.get('player1_color', 'color-player-none')
    player2_color = request.session.get('player2_color', 'color-player-none')
    max_point = request.session.get('max_point', 10)

    if request.method == "POST":
        player1_id = request.POST.get('player1_id')
        player2_id = request.POST.get('player2_id')
        player1_score = int(request.POST.get('player1_score', 0))
        player2_score = int(request.POST.get('player2_score', 0))

        player1 = User.objects.get(id=player1_id)
        player2 = User.objects.get(id=player2_id)

        if player1_score >= max_point:
            winner = player1
        elif player2_score >= max_point:
            winner = player2
        else:
            winner = None

        game = Game.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            player1_score=player1_score,
            player2_score=player2_score
        )
        return JsonResponse({'status': 'success', 'message': 'Game updated successfully'})

    return render(request, 'partials/game.html', {
        'room_name': room_name,
        'player1_color': player1_color,
        'player2_color': player2_color,
        'max_point': max_point,
    })

@csrf_protect
@login_required
def create_custom(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        room_name = data.get('roomName')
        player1_color = data.get('player1Color')
        player2_color = data.get('player2Color')
        max_point = data.get('maxPoint')

        if not all([room_name, player1_color, player2_color, max_point]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        request.session['player1_color'] = player1_color
        request.session['player2_color'] = player2_color
        request.session['max_point'] = max_point

        return JsonResponse({'redirect': True, 'url': f'/game/{room_name}'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_protect
@login_required
def game_custom(request, room_name):
    if not room_name.endswith("_room"):
        room_name += "_room"
    # if room_name != f"{request.user.username}_room":
        # return JsonResponse({"error": "You cannot access this room."}):
    
    player1_color = request.session.get('player1_color', 'color-player-none')
    player2_color = request.session.get('player2_color', 'color-player-none')
    max_point = request.session.get('max_point', 10)

    if request.method == "POST":
        player1_id = request.POST.get('player1_id')
        player2_id = request.POST.get('player2_id')
        player1_score = int(request.POST.get('player1_score', 0))
        player2_score = int(request.POST.get('player2_score', 0))

        player1 = User.objects.get(id=player1_id)
        player2 = User.objects.get(id=player2_id)

        if player1_score >= max_point:
            winner = player1
        elif player2_score >= max_point:
            winner = player2
        else:
            winner = None

        game = Game.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            player1_score=player1_score,
            player2_score=player2_score
        )
        return JsonResponse({'status': 'success', 'message': 'Game updated successfully'})

    return render(request, 'partials/gameCustom.html', {
        'room_name': room_name,
        'player1_color': player1_color,
        'player2_color': player2_color,
        'max_point': max_point,
    })

@csrf_protect
@login_required
def create_room(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        room_name = data.get('roomName')
        player1_color = data.get('player1Color')
        player2_color = data.get('player2Color')
        max_point = data.get('maxPoint')

        if not all([room_name, player1_color, player2_color, max_point]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        request.session['player1_color'] = player1_color
        request.session['player2_color'] = player2_color
        request.session['max_point'] = max_point

        return JsonResponse({'redirect': True, 'url': f'/game/{room_name}'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_protect
@login_required
def game_room(request, room_name):
    if not room_name.endswith("_room"):
        room_name += "_room"
    # if room_name != f"{request.user.username}_room":
        # return JsonResponse({"error": "You cannot access this room."}):
    
    player1_color = request.session.get('player1_color', 'color-player-none')
    player2_color = request.session.get('player2_color', 'color-player-none')
    max_point = request.session.get('max_point', 10)

    if request.method == "POST":
        player1_id = request.POST.get('player1_id')
        player2_id = request.POST.get('player2_id')
        player1_score = int(request.POST.get('player1_score', 0))
        player2_score = int(request.POST.get('player2_score', 0))

        player1 = User.objects.get(id=player1_id)
        player2 = User.objects.get(id=player2_id)

        if player1_score >= max_point:
            winner = player1
        elif player2_score >= max_point:
            winner = player2
        else:
            winner = None

        game = Game.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            player1_score=player1_score,
            player2_score=player2_score
        )
        return JsonResponse({'status': 'success', 'message': 'Game updated successfully'})

    return render(request, 'partials/game.html', {
        'room_name': room_name,
        'player1_color': player1_color,
        'player2_color': player2_color,
        'max_point': max_point,
    })

@csrf_protect
@login_required
def create_tournament(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        room_name = data.get('roomName')
        player1_color = data.get('player1Color')
        player2_color = data.get('player2Color')
        max_point = data.get('maxPoint')

        if not all([room_name, player1_color, player2_color, max_point]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        request.session['player1_color'] = player1_color
        request.session['player2_color'] = player2_color
        request.session['max_point'] = max_point

        return JsonResponse({'redirect': True, 'url': f'/tournament/{room_name}'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_protect
@login_required
def game_tournament(request, room_name):
    if not room_name.endswith("_room"):
        room_name += "_room"
    # if room_name != f"{request.user.username}_room":
        # return JsonResponse({"error": "You cannot access this room."}):
    
    player1_color = request.session.get('player1_color', 'color-player-none')
    player2_color = request.session.get('player2_color', 'color-player-none')
    max_point = request.session.get('max_point', 10)

    if request.method == "POST":
        player1_id = request.POST.get('player1_id')
        player2_id = request.POST.get('player2_id')
        player1_score = int(request.POST.get('player1_score', 0))
        player2_score = int(request.POST.get('player2_score', 0))

        player1 = User.objects.get(id=player1_id)
        player2 = User.objects.get(id=player2_id)

        if player1_score >= max_point:
            winner = player1
        elif player2_score >= max_point:
            winner = player2
        else:
            winner = None

        game = Game.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            player1_score=player1_score,
            player2_score=player2_score
        )
        return JsonResponse({'status': 'success', 'message': 'Game updated successfully'})

    return render(request, 'partials/tournament.html', {
        'room_name': room_name,
        'player1_color': player1_color,
        'player2_color': player2_color,
        'max_point': max_point,
    })

@csrf_protect
@login_required
def game(request):
    player1_color = request.session.get('player1_color', 'color-player-none')
    player2_color = request.session.get('player2_color', 'color-player-none')
    max_point = request.session.get('max_point', 10)

    if request.method == "POST":
        player1_id = request.POST.get('player1_id')
        player2_id = request.POST.get('player2_id')
        player1_score = int(request.POST.get('player1_score', 0))
        player2_score = int(request.POST.get('player2_score', 0))

        player1 = User.objects.get(id=player1_id)
        player2 = User.objects.get(id=player2_id)

        if player1_score >= max_point:
            winner = player1
        elif player2_score >= max_point:
            winner = player2
        else:
            winner = None

        game = Game.objects.create(
            player1=player1,
            player2=player2,
            winner=winner,
            player1_score=player1_score,
            player2_score=player2_score
        )
        return JsonResponse({'status': 'success', 'message': 'Game updated successfully'})

    return render(request, 'partials/game.html', {
        'player1_color': player1_color,
        'player2_color': player2_color,
        'max_point': max_point
    })
