from django.urls import path
from .views import login, callback

urlpatterns = [
    path('login/', login, name='instagram_login'),
    path('callback/', callback, name='instagram_callback'),
]