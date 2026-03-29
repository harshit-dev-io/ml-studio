from django.urls import path
from .views import Workspace_Create_API

urlpatterns = [
    path("create/" , Workspace_Create_API.as_view()),
]