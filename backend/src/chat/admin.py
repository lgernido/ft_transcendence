from django.contrib import admin
from .models import Channel, Message

# Register your models here.
admin.site.register(Channel)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('channel', 'content', 'timestamp') 
