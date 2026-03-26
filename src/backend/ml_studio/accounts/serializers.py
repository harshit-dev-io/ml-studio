from rest_framework import serializers
from .models import User

class Signup_Serializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username' , 'display_name']
        extra_kwargs = {
            'username' : {"required" : True},
            'display_name' : {"required" : True}
        }