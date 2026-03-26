from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .services import Get_or_Create_User
from .serializers import Signup_Serializer
# Create your views here.

class Signup_API(APIView):
    def post(self , request):
        auth_token = request.headers.get("Authorization")

        serializer = Signup_Serializer(data = request.data)

        if serializer.is_valid(raise_exception = True):
            if not auth_token or not auth_token.startswith("Bearer "):
                return Response({"error": "Invalid or missing token. Use format 'Bearer <token>'."} , status=status.HTTP_401_UNAUTHORIZED)
            
            id_token = auth_token.split(" ")[1]
        
        
            user , created = Get_or_Create_User(id_token=id_token ,serializer_data=serializer.validated_data )

            if not user :
                return Response({"error": "Invalid token or database error"}, status=status.HTTP_401_UNAUTHORIZED)
            
            if created:
                return Response({"message": "Account created successfully"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Account already exists"}, status=status.HTTP_200_OK)
        else:
            return Response({"error" : serializer.errors}, status=status.HTTP_400_BAD_REQUEST )