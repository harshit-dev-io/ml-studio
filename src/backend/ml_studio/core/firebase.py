import firebase_admin
from firebase_admin import credentials
from django.conf import settings
import json
import os

def firebase_initialization():

    if not firebase_admin._apps:
        try:
            firebase_cred_env = os.getenv("FIREBASE_CREDS")
            firebase_creds = json.loads(firebase_cred_env)
            cred = credentials.Certificate(firebase_creds)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully!")
        except:
            print("Invlaid firebase credentials")
    
