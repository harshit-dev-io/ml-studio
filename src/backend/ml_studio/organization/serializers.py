from rest_framework import serializers
from .models import Organization , Membership

class Organization_List_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['name' , 'slug' , 'type']

class Organization_Create_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['name']