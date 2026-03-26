from .models import User
import logging

logger = logging.getLogger(__name__)

def Check_User(* , uid):
    try:
        user_exists = User.objects.filter(uid = uid).exists()

        if user_exists:
            return True 
        else:
            return False
    except Exception as e:
        logger.error(f"Database Error occurred while checking user {uid}: {e}")
        return False


def Create_User(* , uid , email , serializer_data):
    try:
        user = User.objects.create(
                uid = uid,
                email = email ,
                **serializer_data
                )
        
        # TODO: Add First-Time setup logic

        return user  
    except Exception as e:
        logger.error(f"Database error while saving user {uid} : {e}")
        return None