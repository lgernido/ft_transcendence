from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.translation import activate
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect
from django.http import JsonResponse

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Game
from users.models import Social
import json

import base64
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist

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
    return render(request, 'partials/mypage.html')

@csrf_protect
@login_required
def lobby_private(request):
    return render(request, 'partials/lobby_private.html')

@csrf_protect
@login_required
def lobby_tournament(request):
    return render(request, 'partials/lobby_tournament.html')

@csrf_protect
def stats(request):
    return render(request, 'partials/stats.html')

@csrf_protect
@login_required
def chat(request):
    return render(request, 'partials/chat.html')

def connect(request):
    return render(request, 'partials/connect.html')

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
    return render(request, 'partials/lobby.html')

@csrf_protect
def amis(request):
    return render(request, 'partials/amis.html')

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

                if current_avatar_name == new_avatar_name:
                    return JsonResponse({'success': True, 'message': 'Avatar is already up-to-date.'})
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
    return render(request, 'partials/compte.html', {'user': request.user})


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

@csrf_protect
def chat(request):
    return render(request, 'partials/chat.html')
