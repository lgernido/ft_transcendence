from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.http import JsonResponse

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import *
import json

# Create your views here.

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