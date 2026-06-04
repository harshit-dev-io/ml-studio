from django.db import models
from organization.models import Organization
import uuid

# Create your models here.
class DataSet(models.Model):
    id = models.UUIDField(default=uuid.uuid4 , unique=True , editable= False , primary_key= True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    SOURCE_TYPE_CHOICES = (
        ("kaggle" , "Kaggle"),
        ("local" , "Local"),
        # add more source types as needed
    )

    source_type = models.CharField(max_length=50 , choices=SOURCE_TYPE_CHOICES)
    file_path = models.CharField(max_length=1024 , null = True , blank= True)  # path to the dataset file

    STATUS_CHOICES = (
        ("qurantine" , "Qurantine"),
        ("infected" , "Infected"),
        ("failed" , "Failed"),
        ("processing" , "Processing"),
        ("ready" , "Ready") 
    )

    status = models.CharField(max_length=256 , choices=STATUS_CHOICES)

    column_schema = models.JSONField(default=dict) # (for ui purpose) initally a empty dict 
    created_at = models.DateTimeField(auto_now_add = True)