import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

import django
django.setup()

from django.contrib.auth.models import User
from django_otp.plugins.otp_totp.models import TOTPDevice
from dotenv import load_dotenv

load_dotenv()

def configure_two_factor_auth(username):
    user = User.objects.get(username=username)
    device = TOTPDevice.objects.create(user=user, name="Default")
    device.save()

    print(f"The 2 factor authentication is available for {username}.")

if __name__ == "__main__":
    username = os.getenv("SUPERUSER_USERNAME", "admin")

    configure_two_factor_auth(username)