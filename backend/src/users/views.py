from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout

from .forms import AvatarForm
from .models import *

import json

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserProfileSerializer, FriendshipActionSerializer

import base64
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist

@csrf_exempt
def create_account(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        password2 = data.get('password2')
        new_avatar = data.get('avatar')

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

        # Traitement du nouvel avatar si disponible
        try:
            social = Social.objects.get(user=user)
        except Social.DoesNotExist:
            return JsonResponse({'error': 'Social profile not found.'}, status=404)
        if new_avatar:
            # Vérification si l'avatar est une chaîne base64
            if new_avatar.startswith('data:image'):
                format, imgstr = new_avatar.split(';base64,')
                ext = format.split('/')[1]
                image_data = ContentFile(base64.b64decode(imgstr), name=f"{user.username}_avatar.{ext}")
                social.update_avatar(image_data)
            else:
                # Si ce n'est pas base64, assumez qu'il s'agit d'une URL ou d'un chemin d'image
                social.update_avatar(new_avatar)

        return JsonResponse({'success': True})
    return render(request, 'partials/create_account.html')


# ================================================================================================

class UserProfileList(APIView):
    def get(self, request):
        current_user = request.user
        try:
            users = User.objects.filter(is_staff=False).exclude(id=current_user.id).order_by('username')
            if not users:
                return Response({"error": "No users found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = UserProfileSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class FriendshipActionView(APIView):
    def post(self, request):
        current_user = request.user
        if current_user.is_anonymous:
            return Response(
                {"error": "You must be authenticated to perform this action."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        serializer = FriendshipActionSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data['action']
            user_id = serializer.validated_data['user_id']
            current_user_social = request.user.social
            target_user = User.objects.get(id=user_id).social
            
            if action == 'add':
                current_user_social.add_friend(target_user)
                return Response({"message": f"User {target_user.user.username} added as a friend."}, status=status.HTTP_200_OK)
            elif action == 'remove':
                current_user_social.remove_friend(target_user)
                return Response({"message": f"User {target_user.user.username} removed from friends."}, status=status.HTTP_200_OK)
            elif action == 'block':
                current_user_social.block_user(target_user)
                return Response({"message": f"User {target_user.user.username} blocked."}, status=status.HTTP_200_OK)
            elif action == 'unblock':
                current_user_social.unblock_user(target_user)
                return Response({"message": f"User {target_user.user.username} unblocked."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class ContactActionView(APIView):
    def get(self, request):
        current_user = request.user

        # Vérification de l'authentification
        if current_user.is_anonymous:
            return Response(
                {"error": "You must be authenticated to perform this action."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Vérification du paramètre de requête
        query = request.query_params.get('action')
        if not query:
            return Response(
                {"error": "Query parameter 'action' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Exclusion du staff (si nécessaire) et gestion des différentes actions
        if query == 'users':
            users = User.objects.filter(is_staff=False).exclude(id=current_user.id).order_by('username')
            serializer = UserProfileSerializer(users, many=True)
            return Response(serializer.data)

        elif query == 'added':
            # Récupérer les amis
            added_users = current_user.social.friends_user.all()
            serializer = UserProfileSerializer(added_users, many=True)
            return Response(serializer.data)

        elif query == 'blocked':
            # Récupérer les utilisateurs bloqués
            blocked_users = current_user.social.blocked_user.all()
            serializer = UserProfileSerializer(blocked_users, many=True)
            return Response(serializer.data)

        # Si le type d'action est invalide
        return Response(
            {"error": f"Invalid query type '{query}'. Expected 'users', 'added', or 'blocked'."},
            status=status.HTTP_400_BAD_REQUEST
        )

class GetUsers(APIView):
    def get(self, request):
        current_user = request.user

        # Vérification de l'authentification
        if current_user.is_anonymous:
            return Response(
                {"error": "You must be authenticated to perform this action."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # Vérification du paramètre de requête
        query = request.query_params.get('query')
        if not query:
            return Response(
                {"error": "Query parameter 'query' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        users = User.objects.filter(username__icontains=query, is_staff=False).exclude(id=current_user.id)
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)
    
def GetUserId(request):
    return JsonResponse({'user_id': request.user.id})


def GetUserByName(request):
    user_name = request.GET.get('user_name')
    if user_name:
        try:
            data_user = User.objects.get(username=user_name)
            return JsonResponse({
                'id': data_user.id,
                'username': data_user.username,
            })
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    return JsonResponse({'error': 'Username parameter is missing'}, status=400)

def GetUserById(request):
    user_id = request.GET.get('user_id')
    if user_id:
        try:
            data_user = User.objects.get(id=user_id)
            return JsonResponse({
                'id': data_user.id,
                'username': data_user.username,
            })
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    return JsonResponse({'error': 'Username parameter is missing'}, status=400)

