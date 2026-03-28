from django.db import models
from organization.models import Organization 
import uuid
# Create your models here.

class Tenant_Base_Model(models.Model):
    id = models.UUIDField(primary_key=True , default=uuid.uuid4 , editable=False)
    organization = models.ForeignKey(Organization , on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
