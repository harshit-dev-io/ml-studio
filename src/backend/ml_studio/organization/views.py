from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from organization.models import Membership
from rest_framework import status 
from .selectors import Get_Orgs_For_User
from .services import Create_Org
from .serializers import Organization_List_Serializer , Organization_Create_Serializer
from core.authentication import Firebase_Authentication_Middleware 
import logging
from django.http import HttpResponseForbidden
from rest_framework.exceptions import AuthenticationFailed , PermissionDenied

# Create your views here.

logger = logging.getLogger(__name__)

class Tenant_Base_API(APIView):
    authentication_classes = [Firebase_Authentication_Middleware]
    def initial(self , request , *args , **kwargs):
        if request.user and request.user.is_authenticated: 
            try:
                request.membership = Membership.objects.get(organization = request.organization , user = request.user)
            except Membership.DoesNotExist :
                raise PermissionDenied('No access to this organization')
            except Exception as e :
                logger.error(f"Error occurred while fetching organization {request.org_slug}: {e}")
                request.membership = None
                
            return super().initial(request,*args,**kwargs)
        else:
            raise AuthenticationFailed("Authentication required")

class Get_Org_List_API(Tenant_Base_API):
    def get(self , request):
        organizations = Get_Orgs_For_User(user = request.user)
        serializer = Organization_List_Serializer(organizations  , many = True)        
        return Response({f"message : {serializer.data}" } , status = status.HTTP_200_OK)
        
class Create_Org_API(Tenant_Base_API):
    def post(self , request):
        serializer = Organization_Create_Serializer(data = request.data)
        if serializer.is_valid():
            organization = Create_Org(name = serializer.validated_data['name'] , user = request.user , type="team")
            serializer = Organization_List_Serializer(organization) 
            return Response({f"message : organization created "} , status = status.HTTP_200_OK)
        else:
            return Response({f"error : {serializer.errors}" } , status = status.HTTP_400_BAD_REQUEST)