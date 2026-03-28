from django.db import models
from core.models import Tenant_Base_Model
from autoslug import AutoSlugField
from accounts.models import User

# Create your models here.

class Workspace(Tenant_Base_Model):
    name = models.CharField(max_length=255)
    slug = AutoSlugField(populate_from = "name" , unique = True)

    class Meta:
        unique_together = ['name' , "organization"]

