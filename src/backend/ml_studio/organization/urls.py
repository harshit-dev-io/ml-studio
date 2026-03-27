from django.urls import path
from .views import Get_Org_List_API , Create_Org_API

urlpatterns = [
    path("list/" , Get_Org_List_API.as_view()),
    path("create/" , Create_Org_API.as_view()),
]