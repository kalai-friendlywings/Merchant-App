from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.conf import settings
import uuid
import os

# ---------------------- Merchant Manager -----------------------
class MerchantManager(BaseUserManager):
    def create_user(self, email, full_name, mobile_no, password=None, **extra_fields):
        if not email:
            raise ValueError('Merchants must have an email address')
        if not full_name:
            raise ValueError('Merchants must have a full name')
        if not mobile_no:
            raise ValueError('Merchants must have a mobile number')

        email = self.normalize_email(email).lower()
        user = self.model(email=email, full_name=full_name, mobile_no=mobile_no, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, mobile_no, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, full_name, mobile_no, password, **extra_fields)

# ---------------------- Merchant Model -------------------------
class Merchant(AbstractBaseUser, PermissionsMixin):
    CATEGORY_CHOICES = [
        ('Grocery', 'Grocery'),
        ('Mobile', 'Mobile'),
        ('Fashion', 'Fashion'),
        ('Food', 'Food'),
        ('Technology', 'Technology'),
        ('Home & Appliance', 'Home & Appliance'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    mobile_no = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?\d{10,15}$', message="Enter a valid mobile number.")]
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = MerchantManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'mobile_no']

    def __str__(self):
        return self.email

# ---------------------- Merchant Profile -----------------------
def profile_image_upload_path(instance, filename):
    return f'merchant_profiles/{instance.merchant.id}/profile/{filename}'

def banner_image_upload_path(instance, filename):
    return f'merchant_profiles/{instance.merchant.id}/banner/{filename}'

class MerchantProfile(models.Model):
    merchant = models.OneToOneField(Merchant, on_delete=models.CASCADE, related_name='profile')
    business_name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=Merchant.CATEGORY_CHOICES)
    address = models.TextField()
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    profile_image = models.ImageField(upload_to=profile_image_upload_path, null=True, blank=True)
    banner_image = models.ImageField(upload_to=banner_image_upload_path, null=True, blank=True)
    is_onboarded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.business_name} ({self.merchant.email})"

# ---------------------- Category Model -------------------------
class MasterCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    business_category = models.CharField(max_length=100, choices=Merchant.CATEGORY_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.business_category})"

# ---------------------- Master Product Model -------------------
class MasterProduct(models.Model):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100, blank=True, null=True)
    category = models.ForeignKey(MasterCategory, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='master_product_images/', null=True, blank=True)

    def __str__(self):
        category_name = self.category.name if self.category else "Uncategorized"
        return f"{self.name} ({self.brand}) - {category_name}" if self.brand else f"{self.name} - {category_name}"

class MasterProductUpload(models.Model):
    excel_file = models.FileField(upload_to="master_uploads/")
    image_zip = models.FileField(upload_to="master_uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Upload @ {self.uploaded_at}"

# ---------------------- Product Model --------------------------
def product_image_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('merchant_products', str(instance.merchant.id), filename)



class Product(models.Model):
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE)
    master_product = models.ForeignKey(MasterProduct, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    stock = models.PositiveIntegerField(default=0)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to=product_image_upload_path, blank=True, null=True)
    category = models.ForeignKey(MasterCategory, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def copy_image_from_master(self, master_product):
        if master_product.image:
            try:
                # Generate unique filename
                filename = f"product_{self.id}_{master_product.image.name.split('/')[-1]}"
                self.image.save(
                    filename,
                    ContentFile(master_product.image.read()),
                    save=True
                )
                return True
            except Exception as e:
                logger.error(f"Error copying image: {str(e)}")
        return False

    def __str__(self):
        business_name = getattr(self.merchant.profile, 'business_name', 'Unknown Business')
        return f"{self.name} - {business_name} ({self.get_status_display()})"

    class Meta:
        ordering = ['-created_at']


class SmartAddSelection(models.Model):
    """Tracks which master products merchants have added"""
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE)
    master_product = models.ForeignKey(MasterProduct, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('merchant', 'master_product')

    def __str__(self):
        return f"{self.merchant.email} added {self.master_product.name}"

# ---------------------- NEW: Pending Product Model -------------------
def pending_product_image_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    # Use a UUID for the filename to avoid collisions, store in a dedicated pending folder
    filename = f"{uuid.uuid4()}.{ext}" 
    return os.path.join('pending_products', str(instance.merchant.id), filename)


class PendingProduct(models.Model):
    merchant = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='pending_products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    stock = models.PositiveIntegerField(default=0)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Can be null initially
    image = models.ImageField(upload_to=pending_product_image_upload_path, blank=True, null=True)
    
    # Category is set by admin
    category = models.ForeignKey(MasterCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_approved = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True) # Admin can add notes during review
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        business_name = getattr(self.merchant.profile, 'business_name', 'Unknown Business')
        return f"PENDING: {self.name} by {self.merchant.full_name} -{business_name} (Approved: {self.is_approved})"

    class Meta:
        ordering = ['-created_at']


# ---------------------- NEW: Notification Model -------------------
class Notification(models.Model):
    recipient = models.ForeignKey(Merchant, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional: link notification to a specific product (e.g., approved product)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True) 
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        read_status = "Read" if self.is_read else "Unread"
        return f"Notification for {self.recipient.email}: {self.message[:50]}... ({read_status})"
