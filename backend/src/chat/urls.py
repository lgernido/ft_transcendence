# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Autres URLs
    path('', views.index, name='idnex'),
    path('search-users/', views.search_users, name='search_users'),
]
