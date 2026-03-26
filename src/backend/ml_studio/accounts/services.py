from firebase_admin import auth 
from .models import User
import logging

logger = logging.getLogger(__name__)

def Get_or_Create_User(* , id_token , serializer_data):
    try:
        decoded = auth.verify_id_token(id_token)
        uid = decoded["uid"]
    except Exception as e:
        logger.error(f"Firebase verification failed: {e}")
        return None , False
    try:
        user , created = User.objects.get_or_create(
                uid = uid,
                defaults= {
                    "email" : decoded.get("email" , ""),
                    **serializer_data
                }
                )
        
        # TODO: Add First-Time setup logic

        return user , created   
    except Exception as e:
        logger.error(f"Database error while saving user {uid} : {e}")
        return None , False