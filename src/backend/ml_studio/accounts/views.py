from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .services import Get_or_Create_User
# Create your views here.

class Signup_API(APIView):
    def post(self , request):
         
        auth_token = request.headers.get("Authorization")

        if not auth_token or not auth_token.startswith("Bearer "):
            return Response({"error": "Invalid or missing token. Use format 'Bearer <token>'."} , status=status.HTTP_401_UNAUTHORIZED)
        
        id_token = auth_token.split(" ")[1]
    
    
        user , created = Get_or_Create_User(id_token=id_token)

        if not user :
            return Response({"error": "Invalid token or database error"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if created:
            return Response({"message": "Account created successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Account already exists"}, status=status.HTTP_200_OK)
    