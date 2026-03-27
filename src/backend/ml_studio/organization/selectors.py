from .models import Organization , Membership

def Get_Orgs_For_User(* , user):

    organizations = Organization.objects.filter(
        memberships__user = user,
        is_archived = False,
        is_deleted = False
    )

    return organizations
