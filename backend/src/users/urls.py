from django.urls import path 
from . import views

urlpatterns = [

    path('', views.index, name='test'),
	
    path('user_profiles/', views.UserProfileList.as_view(), name='user_profile-list'),
    path('friendship/', views.FriendshipActionView.as_view(), name='friendship'),
    path('contacts/', views.ContactsView.as_view(), name='contacts'),
    path('blocked-users/', views.BlockedUsersView.as_view(), name='blocked-users'),
    path('avatar/', views.AvatarView.as_view(), name='avatar'),

]