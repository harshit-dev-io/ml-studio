from .models import Workspace
from django.http import HttpResponseForbidden
from enum import Enum
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__) 

class UserRole(Enum):
    OWNER = 'owner'
    ADMIN = 'admin'
    MEMBER = 'member'
    VIEWER = 'viewer'

def Create_Workspace(* , organization , user, membership , name):
    if membership.role not in [UserRole.OWNER.value,UserRole.ADMIN.value , UserRole.MEMBER.value]:
        return HttpResponseForbidden("Only Owners , Admins and Members can create workspaces.")
    
    try:
        workspace = Workspace.objects.create(
            name = name,
            organization = organization,
            user = user
        )

    except IntegrityError :
        logger.error(f"Workspace creation failed: A workspace with the name '{name}' already exists in organization '{organization.name}'.")
        raise ValueError("workspace with this name already exists")
    except Exception as e :
        logger.error(f"Error occurred while creating workspace '{name}' in organization '{organization.name}': {e}")
        raise HttpResponseForbidden(f"An error occurred while creating the workspace: {e}")
    
    return workspace