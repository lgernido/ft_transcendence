from rest_framework import serializers
from .models import User, Profile, Social

class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.ImageField(source='social.avatar.url', read_only=True)
    games_played = serializers.IntegerField(source='profile.games_played', read_only=True)
    games_win = serializers.IntegerField(source='profile.games_win', read_only=True)
    games_lose = serializers.IntegerField(source='profile.games_lose', read_only=True)
    games_draw = serializers.IntegerField(source='profile.games_draw', read_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'avatar_url', 'games_played', 'games_win', 'games_lose', 'games_draw']
