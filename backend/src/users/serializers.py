from rest_framework import serializers, status
from .models import User, Profile, Social
from rest_framework.views import APIView
from rest_framework.response import Response

class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    games_played = serializers.IntegerField(source='profile.games_played', read_only=True)
    games_win = serializers.IntegerField(source='profile.games_win', read_only=True)
    games_lose = serializers.IntegerField(source='profile.games_lose', read_only=True)
    games_draw = serializers.IntegerField(source='profile.games_draw', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_url', 'games_played', 'games_win', 'games_lose', 'games_draw']

    def get_avatar_url(self, obj):
        if obj.social and obj.social.avatar:
            return obj.social.avatar.url
        return '/media/avatars/default_avatar.png' 


class FriendshipActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['add', 'remove', 'block', 'unblock'])
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this ID does not exist.")
        return value


