from .models import Workspace
from django.http import HttpResponseForbidden
from enum import Enum

class UserRole(Enum):
    OWNER = 'owner'
    ADMIN = 'admin'
    MEMBER = 'member'
    VIEWER = 'viewer'

def Create_Workspace(* , organization , user, membership , name):
    if membership.role not in [UserRole.OWNER.value,UserRole.ADMIN.value , UserRole.MEMBER.value]:
        return HttpResponseForbidden("Only Owners , Admins and Members can create workspaces.")
    
    workspace = Workspace.objects.create(
        name = name,
        organization = organization,
        user = user
    )

    return workspace