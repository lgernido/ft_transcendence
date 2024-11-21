from django.urls import path
from .views import login, callback

urlpatterns = [
    path('login/', login, name='42_login'),
    path('callback/', callback, name='42_callback'),
]