from rest_framework import serializers
from .models import Workspace

class Workspace_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['name' , "slug"]
 