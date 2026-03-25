from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .services import Get_or_Create_User
# Create your views here.


class Signup_API(APIView):
    def post(self , request):
        try: 
            auth_token = request.headers.get("Authorization")
            id_token = auth_token.split(" ")[1]
        except:
            return Response({"error" : "invalid credentials"} , status = 401)
        try:
            user , created = Get_or_Create_User(id_token=id_token)

            if not user :
                return Response({"error": "Invalid token or database error"}, status=status.HTTP_401_UNAUTHORIZED)
            
            if created:
                return Response({"message": "Account created successfully"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Account already exists"}, status=status.HTTP_200_OK)
        except:
            pass
        return Response({"message":"this is a response"} , status = status.HTTP_202_ACCEPTED)

        