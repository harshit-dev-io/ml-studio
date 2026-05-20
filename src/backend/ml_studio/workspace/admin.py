from django.contrib import admin
from .models import Workspace
# Register your models here.


@admin.register(Workspace)
class Workspace_admin(admin.ModelAdmin):
    list_display = ["name" , "slug"]