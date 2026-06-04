from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch
from accounts.models import User
from .models import Organization , Membership
from .views import Tenant_Base_API
from rest_framework import status

# Create your tests here.

class Test_Organization(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.firebase_token = "fake firebase token"

        self.user = User.objects.create_user(
            username="username", 
            password="password123", 
            uid= "asdfghjkl" , 
            display_name="test_user", 
            email="harshit392615@gmail.com"
        )
        self.client.force_authenticate(user=self.user)

        self.organization = Organization.objects.create(
            owner=self.user, 
            name="Test Org", 
            type="team"
        )
        
        self.membership = Membership.objects.create(
            organization=self.organization, 
            user=self.user,
            role="owner"
        )

        def mock_inital(view_instance , request , *args , **kwargs):
            request.organization = self.organization 
            request.membership = self.membership

            return super(Tenant_Base_API , view_instance).initial(request , *args , **kwargs)

        
        self.patcher = patch.object(Tenant_Base_API , 'initial' , mock_inital)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()
        return super().tearDown()
    
    @patch('organization.views.Firebase_Authentication_Middleware')
    def test_Org_create_API(self , mock_firebase_auth):
        mock_firebase_auth.return_value = self.user , None

        payload = {
            'name' : 'test_org'
        }

        response = self.client.post("/org/create/" , payload , format = 'json' , HTTP_AUTHORIZATION=f"Bearer {self.firebase_token}")

        self.assertEqual(response.status_code , status.HTTP_200_OK)
        self.assertEqual(response.data['message'] , "organization created successfully")
        
    @patch('organization.views.Firebase_Authentication_Middleware')
    def test_Org_List_API(self , mock_firebase_auth):
        mock_firebase_auth.return_value = self.user , None

        Organization.objects.create(
            owner=self.user, 
            name="Test Org", 
            type="team"
        )

        response = self.client.get("/org/list/" , HTTP_AUTHORIZATION=f"Bearer {self.firebase_token}")

        self.assertEqual(response.status_code , status.HTTP_200_OK)