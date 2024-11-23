from django import forms
from .models import Social

class AvatarForm(forms.ModelForm):
    class Meta:
        model = Social
        fields = ['avatar']  # Seulement le champ avatar pour l'upload d'image
