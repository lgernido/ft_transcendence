from django.contrib import admin
from .models import Channel, Message

class ChannelAdmin(admin.ModelAdmin):
    list_display = ('unique_identifier', 'name', 'mode', 'created_at', 'last_message', 'user_list')
    search_fields = ('name', 'description')
    list_filter = ('mode', 'created_at')

    def user_list(self, obj):
        return ", ".join([user.username for user in obj.users.all()])
    user_list.short_description = 'Utilisateurs'

class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'channel', 'sender', 'timestamp', 'content_preview', 'is_read_by_list')
    search_fields = ('content', 'sender__username')
    list_filter = ('channel', 'timestamp')

    def content_preview(self, obj):
        return obj.content[:50] + ("..." if len(obj.content) > 50 else "")
    content_preview.short_description = 'Contenu'

    def is_read_by_list(self, obj):
        return ", ".join([user.username for user in obj.is_read_by.all()])
    is_read_by_list.short_description = 'Lu par'

admin.site.register(Channel, ChannelAdmin)
admin.site.register(Message, MessageAdmin)
