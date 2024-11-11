from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    # path('search-users/<str:username>', views.search_users, name='search_users'),
    path('search-users/', views.search_users, name='search_users'),
	path('create_private_channel/<int:user_id>/', views.create_private_channel, name='create_private_channel'),
]
