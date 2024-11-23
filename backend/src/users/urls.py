from django.urls import path 
from . import views

urlpatterns = [
    path('add_friend/<int:userid>', views.add_friend, name='add_friend'),
    path('remove_friend/<int:userid>', views.remove_friend, name='remove_friend'),
    path('block_user/<int:userid>', views.block_user, name='block_user'),
    path('unblock_user/<int:userid>', views.unblock_user, name='unblock_user'),
    path('get_contacts/<int:userid>', views.get_contacts, name='get_contacts'),
    path('get_blocked_users/<int:userid>', views.get_blocked_users, name='get_blocked_users'),
	path('update-avatar/', views.update_avatar, name='update_avatar'),
	
    path('user_profiles/', views.UserProfileList.as_view(), name='user_profile-list'),
]