from django.urls import path
from .views import Signup_API

urlpatterns = [
    path('signup/', Signup_API.as_view()),
]
