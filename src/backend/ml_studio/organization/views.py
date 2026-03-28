from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .selectors import Get_Orgs_For_User
from .services import Create_Org
from .serializers import Organization_List_Serializer , Organization_Create_Serializer
# Create your views here.

class Tenant_Base_API(APIView):
    def initial(self , request , *args , **kwargs):
        if request.user and request.user.is_authenticated:
            return super().initial(request,*args,**kwargs)
        else:
            return Response({"error": "Authentication required"}, status = status.HTTP_401_UNAUTHORIZED)

class Get_Org_List_API(Tenant_Base_API):
    def get(self , request):
        organizations = Get_Orgs_For_User(user = request.user)
        serializer = Organization_List_Serializer(organizations  , many = True)        
        return Response({f"message : {serializer.data}" } , status = status.HTTP_200_OK)
        
class Create_Org_API(Tenant_Base_API):
    def post(self , request):
        serializer = Organization_Create_Serializer(data = request.data)
        if serializer.is_valid():
            organization = Create_Org(serializer.validated_data['name'] , user = request.user , type="team")
            serializer = Organization_List_Serializer(organization) 
            return Response({f"message : {serializer.data}" } , status = status.HTTP_200_OK)
        else:
            return Response({f"error : {serializer.errors}" } , status = status.HTTP_400_BAD_REQUEST)