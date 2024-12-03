from django.urls import path
from .views import login_with_42, callback

urlpatterns = [
    path('login/', login_with_42, name='42_login'),
    path('callback/', callback, name='42_callback'),
]