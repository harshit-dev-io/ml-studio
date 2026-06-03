from django.shortcuts import render
from organization.views import Tenant_Base_API
from rest_framework.response import Response
from rest_framework import status
from .services import save_Kaggle_data , save_Local_data
# Create your views here.

class Data_ingestion_API(Tenant_Base_API):
    def post(self , request , *args , **kwargs):
        if not request.data.get("source"):
            return Response({"error" : "no data source provided"} , status=status.HTTP_400_BAD_REQUEST)
        
        source = request.data.get("source")

        if source == "kaggle":
            url = request.data.get("url")
            kaggle_username = request.data.get("kaggle_username")
            kaggle_api_key = request.data.get("kaggle_api_key")
            if not url or "kaggle" not in url or not kaggle_username or not kaggle_api_key :
                return Response({"error" : "provide a proper url and creds "} , status=status.HTTP_400_BAD_REQUEST)
            
            ingestion_status = save_Kaggle_data(organization=request.organization , url = url , kaggleusername=kaggle_username , kaggle_api_key=kaggle_api_key , filename=request.data.get("filename") )

            if not ingestion_status:
                return  Response({"error" : "error while processing data "} , status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

        elif source == "local":
            if "file" not in request.FILES:
                return Response({"error" : "no data provided"} , status=status.HTTP_400_BAD_REQUEST)
            ingestion_status = save_Local_data(organization=request.organization , file=request.FILES.get('file') , filename=request.data.get("filename"))
            
            if not ingestion_status:
                return  Response({"error" : "error while processing data "} , status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        else:
            return Response({"error" : "Invalid Source "} , status=status.HTTP_400_BAD_REQUEST)

        return Response({"message" : "data ingestion in process "} , status=status.HTTP_202_ACCEPTED)          
