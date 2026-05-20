from accounts.models import User
from rest_framework.authentication import BaseAuthentication
from django.http import HttpResponseForbidden
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

class Firebase_Authentication_Middleware(BaseAuthentication):
    def authenticate(self , request):
        auth_token = request.headers.get("Authorization") 

        if not auth_token or not auth_token.startswith("Bearer "):
            return HttpResponseForbidden("Invalid or missing token. Use format 'Bearer <token>'.")
            
        id_token = auth_token.split(" ")[1]

        try:        
            decoded = auth.verify_id_token(id_token)
        except Exception as e:
            logger.error(f"Firebase verification failed: {e}")
            return HttpResponseForbidden("Invalid Firebase token")

        try:
            user = User.objects.get(uid = decoded['uid']) 
        except User.DoesNotExist :
            return (None , decoded)
        except Exception as e:
            logger.error(f"Database error while fetching user {decoded['uid']}: {e}")
            request.user = None
        return (user , None)