from django.shortcuts import render
from organization.views import Tenant_Base_API
from .services import Create_Workspace
from .serializers import Workspace_Serializer , Workspace_Create_Serializer
from rest_framework.response import Response
from rest_framework import status
from .selectors import Get_Workspace_List
# Create your views here.


class Workspace_Create_API(Tenant_Base_API):
    def post(self , request):
        serializer = Workspace_Create_Serializer(data = request.data)

        if serializer.is_valid():
            workspace = Create_Workspace(organization=request.organization , user = request.user , membership=request.membership , name = serializer.validated_data['name'])
            serializer = Workspace_Serializer(workspace)
            return Response({"message":"workspace created successfully"} , status = status.HTTP_201_CREATED)
        else:
            return Response({"error":serializer.errors} , status = status.HTTP_400_BAD_REQUEST)
        
class Workspace_List_API(Tenant_Base_API):
    def get(self , request):
            workspaces = Get_Workspace_List(organization=request.organization , user = request.user , membership=request.membership)
            serializer = Workspace_Serializer(workspaces , many = True)
            return Response({"data":serializer.data} , status = status.HTTP_200_OK)
        