from django.test import TestCase
from accounts.models import User
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch
from organization.models import Organization, Membership 
from .views import Data_ingestion_API


class TestDataIngestionPipeline(TestCase):
    def setUp(self):
        self.client = APIClient()
        
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

        self.patcher = patch.object(
            Data_ingestion_API, 'initial', 
            lambda view_instance, request, *args, **kwargs: 
                setattr(request, 'organization', self.organization) or 
                super(Data_ingestion_API, view_instance).initial(request, *args, **kwargs)
        )
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    @patch('data_ingestion.views.save_Kaggle_data')
    def test_kaggle_ingestion_endpoint_success(self, mock_save_kaggle):
        mock_save_kaggle.return_value = 1
        
        payload = {
            "source": "kaggle",
            "url": "kaggle datasets download -d user/dataset-slug",
            "kaggle_username": "test_user",
            "kaggle_api_key": "fake_api_key",
            "filename": "my_dataset.csv"
        }
        
        response = self.client.post('/data_ingestion/ingestion/', payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(response.data["message"], "data ingestion in process")

    def test_missing_source_returns_bad_request(self):
        payload = {"url": "some_link"}
        response = self.client.post('/data_ingestion/ingestion/', payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_s3_storage_for_kaggle_ingestion(self):
        
        payload = {
            "source": "kaggle",
            # Use a tiny, real dataset slug so the test runs quickly
            "url": "kaggle datasets download ahmettezcantekin/beginner-datasets",
            "kaggle_username": "your_kaggle_username",
            "kaggle_api_key": "your_kaggle_api_key",
            "filename": "my_dataset.csv"
        }
        
        response = self.client.post('/data_ingestion/ingestion/', payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        