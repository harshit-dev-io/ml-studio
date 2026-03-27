from django.db import models
from autoslug import AutoSlugField
import uuid
from accounts.models import User
# Create your models here.
class Organization(models.Model):
    id = models.UUIDField(default=uuid.uuid4 , unique=True , editable=False , primary_key=True)
    name = models.CharField(max_length=255)
    slug = AutoSlugField(populate_from = 'name' , unique = True)
    TYPE_CHOICES = [
        ("personal","Personal"),
        ("team" , "Team")
        ]
    type = models.CharField(choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name}{self.type}"

class Membership(models.Model):
    organization = models.ForeignKey(Organization , on_delete=models.CASCADE , related_name="memberships")
    user = models.ForeignKey(User , on_delete=models.CASCADE , related_name="memberships")
    ROLE_CHOICES = [
        ("owner" , "Owner"),
        ("admin" , "Admin"),
        ("member" , "Member"),
        ("viewer" , "Viewer")
    ]
    role = models.CharField(choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user' , "organization"]