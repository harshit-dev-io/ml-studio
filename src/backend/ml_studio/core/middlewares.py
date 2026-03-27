from organization.models import Organization , Membership
from accounts.models import User
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

class Firebase_Authentication_Middleware(MiddlewareMixin):
    def process_view(self , request , view_func , view_args , view_kwargs):
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
            request.user = User.objects.get(uid = decoded['uid']) 
        except User.DoesNotExist :
            request.user = None
        except Exception as e:
            logger.error(f"Database error while fetching user {decoded['uid']}: {e}")
            request.user = None
        return None


