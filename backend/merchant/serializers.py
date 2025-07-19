from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.files import File
import os

from .models import (
    Merchant, MerchantProfile, Product, MasterCategory, MasterProduct,
    SmartAddSelection, PendingProduct, Notification
)

# ✅ Profile Image Serializer (for dashboard)
class MerchantProfileImageSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    banner_image_url = serializers.SerializerMethodField()

    class Meta:
        model = MerchantProfile
        fields = [
            'profile_image', 'profile_image_url',
            'banner_image', 'banner_image_url',
            'business_name'
        ]
        extra_kwargs = {
            'profile_image': {'required': False, 'allow_null': True},
            'banner_image': {'required': False, 'allow_null': True}
        }

    def get_profile_image_url(self, obj):
        if obj.profile_image and hasattr(obj.profile_image, 'url'):
            return self.context['request'].build_absolute_uri(obj.profile_image.url)
        return None

    def get_banner_image_url(self, obj):
        if obj.banner_image and hasattr(obj.banner_image, 'url'):
            return self.context['request'].build_absolute_uri(obj.banner_image.url)
        return None

    def validate(self, attrs):
        for field in ['profile_image', 'banner_image']:
            if field in attrs and attrs[field] in ['', None]:
                attrs[field] = None
        return attrs


# ✅ Merchant Profile Serializer (editable)
class MerchantProfileSerializer(serializers.ModelSerializer):
    images = MerchantProfileImageSerializer(source='*', read_only=True)

    class Meta:
        model = MerchantProfile
        fields = [
            'business_name', 'category', 'address', 'city',
            'pincode', 'latitude', 'longitude',
            'banner_image', 'profile_image', 'images'
        ]


# ✅ Merchant Registration
class MerchantRegisterSerializer(serializers.ModelSerializer):
    profile = MerchantProfileSerializer(required=False)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Merchant
        fields = [
            'id', 'email', 'full_name', 'mobile_no', 'password',
            'is_active', 'is_staff', 'is_verified',
            'created_at', 'updated_at', 'profile'
        ]
        read_only_fields = ('is_active', 'is_staff', 'is_verified', 'created_at', 'updated_at')

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        password = validated_data.pop('password')
        merchant = Merchant.objects.create_user(password=password, **validated_data)
        if profile_data:
            MerchantProfile.objects.create(merchant=merchant, **profile_data)
        return merchant


# ✅ Merchant Login
class MerchantLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.", code='authorization')
        attrs['user'] = user
        return attrs


# ✅ Merchant Onboarding
class MerchantDetailsSerializer(serializers.ModelSerializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=True, coerce_to_string=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=True, coerce_to_string=True)

    class Meta:
        model = MerchantProfile
        fields = [
            'business_name', 'category', 'address', 'city',
            'pincode', 'latitude', 'longitude', 'is_onboarded'
        ]
        extra_kwargs = {
            'business_name': {'required': True},
            'category': {'required': True},
            'address': {'required': True},
            'city': {'required': True},
            'pincode': {'required': True},
        }


# ✅ Basic Merchant Info
class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ['full_name', 'email']


# ✅ Master Category
class MasterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCategory
        fields = ['id', 'name', 'business_category']


# ✅ Master Product
class MasterProductSerializer(serializers.ModelSerializer):
    category = MasterCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=MasterCategory.objects.all(), write_only=True
    )

    class Meta:
        model = MasterProduct
        fields = ['id', 'name', 'brand', 'description', 'image', 'category', 'category_id']


# ✅ Product
class ProductSerializer(serializers.ModelSerializer):
    merchant = serializers.HiddenField(default=serializers.CurrentUserDefault())
    master_product = MasterProductSerializer(read_only=True)
    master_product_id = serializers.PrimaryKeyRelatedField(
        source='master_product', queryset=MasterProduct.objects.all(), write_only=True, required=False, allow_null=True
    )
    category = MasterCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField( # This is used for creating products from scratch (by admins approving PendingProduct)
        source='category', queryset=MasterCategory.objects.all(), write_only=True, required=False, allow_null=True
    )
    
    # Added for manual category creation (if not using master product)
    input_category_name = serializers.CharField(write_only=True, required=False, allow_blank=True) 

    class Meta:
        model = Product
        fields = [
            'id', 'merchant', 'master_product', 'master_product_id',
            'name', 'description', 'stock', 'original_price', 'discount_price',
            'image', 'category', 'category_id', 'created_at',
            'input_category_name' # Include the new field
        ]

    def create(self, validated_data):
        # Logic to handle dynamic category creation if input_category_name is provided
        # This will be primarily used by the admin when approving a pending product
        input_category_name = validated_data.pop('input_category_name', None)
        if input_category_name:
            category, _ = MasterCategory.objects.get_or_create(name=input_category_name.strip(), 
                                                               defaults={'business_category': validated_data['merchant'].profile.category}) # Assign to merchant's business category
            validated_data['category'] = category
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Logic to handle dynamic category creation if input_category_name is provided
        input_category_name = validated_data.pop('input_category_name', None)
        if input_category_name:
            category, _ = MasterCategory.objects.get_or_create(name=input_category_name.strip(),
                                                               defaults={'business_category': instance.merchant.profile.category}) # Assign to merchant's business category
            instance.category = category

        for attr, value in validated_data.items():
            # Exclude image from direct update here, as it's handled by specific image upload endpoints
            if attr == 'image' and value is None: # Allow clearing image, but not updating via direct patch
                instance.image = None
            elif attr != 'image':
                setattr(instance, attr, value)

        instance.save()
        return instance

# ✅ Create Product from Master Product
class ProductCreateFromMasterSerializer(serializers.ModelSerializer):
    master_product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Product
        fields = ['master_product_id', 'stock', 'original_price', 'discount_price']
        extra_kwargs = {
            'stock': {'required': True},
            'original_price': {'required': True},
            'discount_price': {'required': True}
        }

    def validate(self, data):
        if data['original_price'] <= 0:
            raise serializers.ValidationError({"original_price": "Must be > 0"})
        if data['discount_price'] > data['original_price']:
            raise serializers.ValidationError({"discount_price": "Must be ≤ original price"})
        return data

    def create(self, validated_data):
        merchant = self.context['request'].user
        master_product_id = validated_data.pop('master_product_id')
        try:
            master_product = MasterProduct.objects.get(id=master_product_id)
        except MasterProduct.DoesNotExist:
            raise serializers.ValidationError({"master_product_id": "Invalid product ID"})

        product = Product.objects.create(
            merchant=merchant,
            master_product=master_product,
            name=master_product.name,
            category=master_product.category,
            **validated_data
        )

        if master_product.image:
            try:
                product.image.save(
                    os.path.basename(master_product.image.name),
                    File(master_product.image.file),
                    save=True
                )
            except Exception as e:
                print(f"Image copy failed: {e}")

        return product


# ✅ SmartAdd: Category & Products
class SmartAddCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCategory
        fields = ['id', 'name']

class SmartAddProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterProduct
        fields = ['id', 'name', 'brand', 'description', 'image']


# ✅ SmartAdd: Bulk Selection
class BulkSmartAddSerializer(serializers.Serializer):
    category_id = serializers.PrimaryKeyRelatedField(queryset=MasterCategory.objects.all())
    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )

    def validate(self, data):
        # Get merchant's business category
        try:
            business_category = self.context['request'].user.profile.category
        except AttributeError:
            raise serializers.ValidationError("Complete business onboarding first")

        # Verify category belongs to merchant's business type
        category = data['category_id']
        if category.business_category != business_category:
            raise serializers.ValidationError("Category doesn't match your business type")

        # Check for invalid product IDs
        valid_products = MasterProduct.objects.filter(
            id__in=data['product_ids'],
            category=category
        ).values_list('id', flat=True)

        invalid_ids = set(data['product_ids']) - set(valid_products)
        if invalid_ids:
            raise serializers.ValidationError({
                "product_ids": f"Invalid product IDs: {invalid_ids}"
            })

        # Check for duplicates
        existing_ids = SmartAddSelection.objects.filter(
            merchant=self.context['request'].user,
            master_product_id__in=data['product_ids']
        ).values_list('master_product_id', flat=True)

        if existing_ids:
            raise serializers.ValidationError({
                "product_ids": f"Products already added: {existing_ids}"
            })

        return data
        
# ---------------------- NEW: Pending Product Serializer -------------------

def get_absolute_image_url(image_field, request):
    if image_field and hasattr(image_field, 'url'):
        return request.build_absolute_uri(image_field.url)
    return None

class PendingProductSerializer(serializers.ModelSerializer):
    merchant = serializers.HiddenField(default=serializers.CurrentUserDefault())
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PendingProduct
        fields = [
            'id', 'merchant', 'name', 'description', 'stock',
            'original_price', 'discount_price', 'image', 'image_url',
            'is_approved', 'category', 'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ('is_approved', 'category', 'admin_notes', 'created_at', 'updated_at')
        extra_kwargs = {
            'discount_price': {'required': False, 'allow_null': True}
        }
    
    def get_image_url(self, obj):
        return get_absolute_image_url(obj.image, self.context.get('request'))

    def validate(self, data):
        # For new products, ensure name, stock, original_price are present
        if self.instance is None: # Only for creation
            if not data.get('name'):
                raise serializers.ValidationError({"name": "Product name is required."})
            if data.get('stock') is None:
                raise serializers.ValidationError({"stock": "Stock is required."})
            if data.get('original_price') is None:
                raise serializers.ValidationError({"original_price": "Original price is required."})
        
        if data.get('original_price', 0) <= 0:
            raise serializers.ValidationError({"original_price": "Original price must be greater than 0."})
        
        discount_price = data.get('discount_price')
        if discount_price is not None and discount_price > data.get('original_price', 0):
            raise serializers.ValidationError({"discount_price": "Discount price cannot be greater than original price."})
            
        return data

# This serializer is used by admins to approve pending products
class AdminPendingProductApproveSerializer(serializers.ModelSerializer):
    # category_id for selecting the MasterCategory
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=MasterCategory.objects.all(), write_only=True, required=True
    )

    class Meta:
        model = PendingProduct
        fields = [
            'id', 'name', 'stock', 'original_price', 'discount_price', 'description', 
            'image', 'is_approved', 'category_id', 'admin_notes'
        ]
        read_only_fields = ['name', 'stock', 'original_price', 'discount_price', 'description', 'image']


# ---------------------- NEW: Notification Serializer -------------------
class NotificationSerializer(serializers.ModelSerializer):
    # Optionally include product details if notification is about a product
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at', 'product', 'product_name']
        read_only_fields = ['message', 'created_at', 'product', 'product_name']



