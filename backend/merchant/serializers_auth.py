from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Merchant, MerchantProfile

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['email'] = self.user.email
        try:
            merchant = self.user.merchant
            data['is_onboarded'] = merchant.is_onboarded
        except:
            data['is_onboarded'] = False
        return data
