from .models import Workspace
from enum import Enum
from django.http import HttpResponseForbidden

class UserRole(Enum):
    OWNER = 'owner'
    ADMIN = 'admin'
    MEMBER = 'member'
    VIEWER = 'viewer'

def Get_Workspace_List(*,organization , user , membership):
    if membership.role not in [UserRole.OWNER.value,UserRole.ADMIN.value,UserRole.MEMBER.value,UserRole.VIEWER.value]:
        return HttpResponseForbidden("Only Owners , Admins , Members and Viewers can view workspaces. You are not authorized to view workspaces.")

    workspaces = Workspace.objects.filter(organization=organization)

    return workspaces