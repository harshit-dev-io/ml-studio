import firebase_admin
from firebase_admin import credentials
from django.conf import settings
import json
import os
import logging

logger = logging.getLogger(__name__)

def firebase_initialization():
    if not firebase_admin._apps:
        try:
            firebase_cred_env = os.getenv("FIREBASE_CREDS")  # tries to get firebase creds from .env
            if firebase_cred_env:                           
                firebase_creds = json.loads(firebase_cred_env)
                cred = credentials.Certificate(firebase_creds)
            else:                                                          # if creds not in .env then fallback to firebase-adminsdk.json 
                cred_path = os.path.join(settings.BASE_DIR.parent , "firebase-adminsdk.json")
                if not os.path.exists(cred_path):
                    raise FileNotFoundError(f"Credentials file not found at: {cred_path}")
                cred = credentials.Certificate(cred_path)

            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized successfully")

        except json.JSONDecodeError as e :
            logger.error(f"Firebase Fail: FIREBASE_CREDS contains invalid JSON. {e}")
            raise # stop server in case of exception
        except FileNotFoundError as e :
            logger.error(f"Firebase Fail: {e}")
            raise
        except ValueError as e :
            logger.error(f"Firebase Fail: The certificate content is invalid. {e}")
            raise
        except Exception as e :
            logger.error(f"Unexpected Firebase error: {e}")
            raise 