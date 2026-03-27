from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
# Create your views here.

class Tenant_Base_API(APIView):
    def initial(self , request , *args , **kwargs):
        if request.user and request.user.is_authenticated:
            return super().initial(request,*args,**kwargs)
        else:
            return Response({"error": "Authentication required"}, status = status.HTTP_401_UNAUTHORIZED)

