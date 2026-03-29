from django.urls import path
from .views import Workspace_Create_API , Workspace_List_API

urlpatterns = [
    path("create/" , Workspace_Create_API.as_view()),
    path("list/" , Workspace_List_API.as_view()),
]