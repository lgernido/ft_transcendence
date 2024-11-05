from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.http import JsonResponse

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import *
from django.contrib import messages
import json

@csrf_exempt
# @login_required
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
#     if request.method == 'POST':
#         username = request.POST.get('username_connect')
#         password = request.POST.get('password_connect')

#         user = authenticate(request, username=username, password=password)

#         if user is not None:
#             login(request, user)
#             return JsonResponse({'success': True})
#         else:
#             return JsonResponse({'error': 'Echec lors de la connection'}, status=400)
    return render(request, '/index.html')

@csrf_exempt
def create_account(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        password2 = data.get('password2')

        if not email or not username or not password or not password2:
            return JsonResponse({'error': 'Tous les champs sont requis.'}, status=400)

        if password != password2:
            return JsonResponse({'error': 'Les mots de passe ne correspondent pas.'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Ce nom d utilisateur est deja pris.'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Cet email est deja utilise.'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        profile = Profile.objects.create(user=user)
        profile.save()
        return JsonResponse({'success': True})

    return render(request, 'partials/create_account.html')

# @login_required
def my_page(request):
    return render(request, 'partials/mypage.html')

# @login_required
def lobby_private(request):
    return render(request, 'partials/lobby_private.html')

# @login_required
def lobby_tournament(request):
    return render(request, 'partials/lobby_tournament.html')

# @login_required
def stats(request):
    return render(request, 'partials/stats.html')

# @login_required
def chat(request):
    return render(request, 'partials/chat.html')

def connect(request):
    return render(request, 'partials/connect.html')

# @login_required
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

# @login_required
def lobby(request):
    return render(request, 'partials/lobby.html')

# @login_required
def amis(request):
    return render(request, 'partials/amis.html')

# @login_required
def compte(request):
    if request.method == 'POST':
        user = request.user
        
        email = request.POST.get('change_email')
        username = request.POST.get('change_username')
        password = request.POST.get('change_password')

        if User.objects.exclude(pk=user.pk).filter(username=username).exists():
            messages.error(request, "Ce nom d'utilisateur est deja pris.")
            return render(request, 'partials/compte.html', {'user': user})

        user.email = email
        user.username = username

        if password:
            user.set_password(password)
            user.save()
            return render(request, 'index.html')

        user.save()
        messages.success(request, "Profil mis à jour avec succes !")
        render(request, 'partials/compte.html')

    return render(request, 'partials/compte.html', {'user': request.user})


# @login_required
def header(request):
    return render(request, 'partials/header.html')

# @login_required
def logout_view(request):
    logout(request)
    messages.success(request, "Deconnecte !")
    return render(request, 'index.html')
    

