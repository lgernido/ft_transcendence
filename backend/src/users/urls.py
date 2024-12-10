from django.urls import path 
from . import views

urlpatterns = [
    path('user_profiles/', views.UserProfileList.as_view(), name='user_profile-list'),
	path('contact/', views.ContactActionView.as_view(), name='contact'),
    path('friendship/', views.FriendshipActionView.as_view(), name='friendship'),
	path('get_users/', views.GetUsers.as_view(), name="get_users"),
]