from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def store_colors(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        player1_color = data.get('player1Color')
        player2_color = data.get('player2Color')
        max_point = data.get('maxPoint')

        # Stocker les couleurs dans la session
        request.session['player1_color'] = player1_color
        request.session['player2_color'] = player2_color
        request.session['max_point'] = max_point

        return JsonResponse({'message': 'Colors and max point stored successfully'})
    return JsonResponse({'error': 'Invalid request'}, status=400)
    
def home(request):
    return render(request, 'index.html')

def create_account(request):
    return render(request, 'partials/create_account.html')

def my_page(request):
    return render(request, 'partials/myPage.html')

def lobby_private(request):
    return render(request, 'partials/lobby_private.html')

def lobby_tournament(request):
    return render(request, 'partials/lobby_tournament.html')

def stats(request):
    return render(request, 'partials/stats.html')

def chat(request):
    return render(request, 'partials/chat.html')

def connect(request):
    return render(request, 'partials/connect.html')

def game(request):
    player1_color = request.session.get('player1_color', 'color-player-none')
    player2_color = request.session.get('player2_color', 'color-player-none')
    max_point = request.session.get('max_point', 10)

    return render(request, 'partials/game.html', {
        'player1_color': player1_color,
        'player2_color': player2_color,
        'max_point': max_point
    })

def lobby(request):
    return render(request, 'partials/lobby.html')

def amis(request):
    return render(request, 'partials/amis.html')

def compte(request):
    return render(request, 'partials/compte.html')

def header(request):
    return render(request, 'partials/header.html')

