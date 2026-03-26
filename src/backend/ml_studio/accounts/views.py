from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .services import Check_User , Create_User
from .serializers import Signup_Serializer
from firebase_admin import auth 
import logging

# Create your views here.

logger = logging.getLogger(__name__)

class Signup_API(APIView):
    def post(self , request): 
        auth_token = request.headers.get("Authorization") 
        serializer = Signup_Serializer(data = request.data)

        if not auth_token or not auth_token.startswith("Bearer "):
                return Response({"error": "Invalid or missing token. Use format 'Bearer <token>'."} , status=status.HTTP_401_UNAUTHORIZED)
            
        id_token = auth_token.split(" ")[1]

        try:        
            decoded = auth.verify_id_token(id_token)
        except Exception as e:
            logger.error(f"Firebase verification failed: {e}")
            return Response({"error": "Invalid Firebase token"}, status=status.HTTP_401_UNAUTHORIZED)

        user_exists = Check_User(uid=decoded['uid'])

        # print(user_exists)

        if user_exists:
            return Response({"message": "Account already exists"}, status=status.HTTP_200_OK)

        else:
            if serializer.is_valid(raise_exception = True):
                user = Create_User( uid=decoded["uid"] , email=decoded['email'] , serializer_data=serializer.validated_data )

                if not user :
                    return Response({"error": "Failed to create user account"}, status=status.HTTP_401_UNAUTHORIZED)
                
                else:
                    return Response({"message": "Account created successfully"}, status=status.HTTP_201_CREATED)
                
            else:
                return Response({"error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )