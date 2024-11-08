# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Autres URLs
    path('start_private_chat/<str:recipient_username>/', views.start_private_chat, name='start_private_chat'),
]
