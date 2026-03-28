from .models import Organization , Membership
from enum import Enum

class UserRole(Enum):
    OWNER = 'owner'
    ADMIN = 'admin'
    MEMBER = 'member'
    VIEWER = 'viewer'

def Create_Org(* , name , user , type):

    organization = Organization.objects.create(
        name = name,
        type = type
    )

    membership = Membership.objects.create(
        organization = organization,
        user = user ,
        role = UserRole.OWNER.value
    )

    return Organization