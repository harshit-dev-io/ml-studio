from django.contrib import admin
from .models import User
# Register your models here.

@admin.register(User)
class User_Admin(admin.ModelAdmin):
    list_display = ('uid', 'email', 'created_at', 'is_active')
    
    search_fields = ('uid', 'email')
    
    readonly_fields = ('uid', 'created_at')