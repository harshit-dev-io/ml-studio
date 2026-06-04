from django.urls import path
from .views import Data_ingestion_API

urlpatterns = [
    path("ingestion/" , Data_ingestion_API.as_view()),
]