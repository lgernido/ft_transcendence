from django.contrib.auth.models import User
from .models import Profile 
from users.models import Social

def user_profile(request):
    if request.user.is_authenticated:
        try:
            profile = Profile.objects.get(user=request.user)
            social = Social.objects.get(user=request.user)
        except (Profile.DoesNotExist, Social.DoesNotExist):
            profile = None
            social = None
    else:
        profile = None
        social = None

    return {
        'user': request.user,
        'profile': profile,
        'social': social,
    }
