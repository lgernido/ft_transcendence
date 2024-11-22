from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
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


# ================================================================================================


def add_friend(request, user_id):
    user = request.user
    person = get_object_or_404(User, id=user_id)
    profile = user.profile

    if user != person:
        profile.add_friend(person)
        return JsonResponse({"message": f"User with ID {person.user} added to your friends."})
    else:
        return JsonResponse({"error": "You cannot add yourself as a friend."}, status=400)

def remove_friend(request, user_id):
    user = request.user
    person = get_object_or_404(User, id=user_id)
    profile = user.profile

    if person in profile.friends_user.all():
        profile.remove_friend(person)
        return JsonResponse({"message": f"User with ID {person.user} removed from your friends."})
    else:
        return JsonResponse({"error": f"User with ID {person.user} is not in your friends list."}, status=400)


def block_user(request, user_id):
    user = request.user
    person = get_object_or_404(User, id=user_id)
    profile = user.profile

    if user != person:
        profile.block_user(person)
        return JsonResponse({"message": f"User with ID {person.user} has been blocked."})
    else:
        return JsonResponse({"error": "You cannot block yourself."}, status=400)

def unblock_user(request, user_id):
    user = request.user
    person = get_object_or_404(User, id=user_id)
    profile = user.profile

    if person in profile.blocked_user.all():
        profile.unblock_user(person)
        return JsonResponse({"message": f"User with ID {person.user} has been unblocked."})
    else:
        return JsonResponse({"error": f"User with ID {person.user} is not in your blocked list."}, status=400)

def get_contacts(request):
    user = request.user
    profile = user.profile
    contacts = profile.get_contacts()

    contacts_list = [{"id": contact.id, "username": contact.username, "email": contact.email} for contact in contacts]
    return JsonResponse({"contacts": contacts_list})


def get_blocked_users(request):
    user = request.user
    profile = user.profile
    blocked_users = profile.get_blocked_users()

    blocked_list = [{"id": blocked.id, "username": blocked.username, "email": blocked.email} for blocked in blocked_users]
    return JsonResponse({"blocked_users": blocked_list})

def get_users(request):
    pass
