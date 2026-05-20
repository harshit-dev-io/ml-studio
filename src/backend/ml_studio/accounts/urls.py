from django.urls import path
from .views import Signup_API , Login_API

urlpatterns = [
    path('signup/', Signup_API.as_view()),
    path('login/' , Login_API.as_view()),
]
