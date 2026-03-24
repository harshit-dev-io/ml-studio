from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
# Create your views here.


class Signup_API(APIView):
    def post(self , request):
        try: 
            auth_token = request.headers.get("Authorization")
            id_token = auth_token.split(" ")[1]
        except:
            return Response({"error" : "invalid credentials"} , status = 401)
        # TODO: Add signup logic and Firebase verification here
        return Response({"message":"this is a response"} , status = status.HTTP_202_ACCEPTED)

        