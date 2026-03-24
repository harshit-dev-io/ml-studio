from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
# Create your models here.

class User(AbstractUser):
    id = models.UUIDField(primary_key=True , default=uuid.uuid4 , editable=False)
    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)
    uid = models.CharField(max_length=255 , unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

