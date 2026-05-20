from django.contrib import admin
from .models import Organization , Membership
# Register your models here.

@admin.register(Organization)
class Organization_Admin(admin.ModelAdmin):
    list_display = ['name' ,'slug', 'type' , 'created_at' , 'is_active' , 'is_archived' , 'is_deleted']
    search_fields = ['name' , 'slug']
    readonly_fields = ['created_at']

@admin.register(Membership)
class Membership_Admin(admin.ModelAdmin):
    list_display = ['organization' , 'user' , 'role' , 'joined_at']
    search_fields = ['organization__name' , 'user__email' , 'role']
    readonly_fields = ['joined_at']