from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch
from rest_framework import status
from .models import User

# Create your tests here.
class Test_Signup_Login(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.firebase_token = "this is a fake token"

    @patch("accounts.views.auth.verify_id_token")
    def test_signup(self , mock_verify_id_token):

        mock_verify_id_token.return_value = {
            "uid" : 1,
            "email" : "testuser@gmail.com"
        }

        payload = {
            "username":"test_user",
            "display_name":"test_user_1"
        }

        response = self.client.post('/auth/signup/', payload , format = 'json' , HTTP_AUTHORIZATION=f"Bearer {self.firebase_token}") 

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Account created successfully")

    @patch("accounts.views.auth.verify_id_token")
    def test_Login(self , mock_verify_id_token):

        User.objects.create(
            uid = 1 ,
            email = "testuser@gmail.com" ,
            username = "test_user",
            display_name = "test_user_1",
        )

        mock_verify_id_token.return_value = {
            "uid" : 1,
            "email" : "testuser@gmail.com"
        }

        payload = {}

        response = self.client.post('/auth/login/', payload , format = 'json' , HTTP_AUTHORIZATION=f"Bearer {self.firebase_token}") 

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "user exists ")