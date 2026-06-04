from .models import Organization , Membership
from enum import Enum
from django.http import HttpResponseForbidden

class UserRole(Enum):
    OWNER = 'owner'
    ADMIN = 'admin'
    MEMBER = 'member'
    VIEWER = 'viewer'

def Create_Org(* , name , user , type):

    if not user :
        return HttpResponseForbidden("Authentication required") 

    organization = Organization.objects.create(
        name = name,
        type = type,
        owner = user
    )

    membership = Membership.objects.create(
        organization = organization,
        user = user ,
        role = UserRole.OWNER.value
    )

    return 1
