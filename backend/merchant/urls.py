from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Authentication and Merchant
    MerchantRegisterView,
    MerchantLoginView,
    CurrentMerchantView,
    MerchantProfileView,
    MerchantOnboardingStatusView,

    # Product Management
    ProductViewSet,
    ProductCreateFromMasterView,
    MasterCategoryList,
    MasterProductByCategory,
    MerchantProfileView,
    
    # Excel Upload Views (to be implemented if not yet)
    # ProductUploadView,           # Excel Upload - Merchant Products
    MasterProductUploadView,     # Excel Upload - Admin Master Products (optional)

    # Profile Image Upload
    MerchantProfileViewSet,
    SmartAddCategoriesView, # merchant selects their shop related products 
    SmartAddProductsView,   # merchant add the products via smart add
    SmartAddBulkAddView ,
     # NEW: Pending Products & Notifications
    PendingProductViewSet, # For admin to manage pending products
    NotificationViewSet, # Changed from NotificationAPIView to NotificationViewSettions
)

# DRF Router setup for ViewSets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'merchant-profile', MerchantProfileViewSet, basename='merchant-profile')
router.register(r'admin/pending-products', PendingProductViewSet, basename='pending-product') # NEW for admin
router.register(r'notifications', NotificationViewSet, basename='notification') # NEW: Register NotificationViewSet


urlpatterns = [
    # Merchant Auth & Onboarding
    path('register/', MerchantRegisterView.as_view(), name='merchant-register'),
    path('login/', MerchantLoginView.as_view(), name='merchant-login'),
    path('auth/me/', CurrentMerchantView.as_view(), name='current-merchant'),
    path('profile/', MerchantProfileView.as_view(), name='merchant-profile'), 
    path('onboarding-status/', MerchantOnboardingStatusView.as_view(), name='onboarding-status'),

    # Profile images (upload, update, get) via ViewSet action
    path('', include(router.urls)),

    # Excel Uploads (SmartAdd)
    # path('products/upload/', ProductUploadView.as_view(), name='product-upload'),  # From Excel file
    path('master-products/upload/', MasterProductUploadView.as_view(), name='master-product-upload'),  # Admin only (optional)

    # MasterProduct and Category utilities
    path('master-products/', MasterProductByCategory.as_view(), name='master-product-by-category'),
    path('master-categories/', MasterCategoryList.as_view(), name='master-category-list'),
    path('products/create/', ProductCreateFromMasterView.as_view(), name='create-product-from-master'),
    path('smart-add/categories/', SmartAddCategoriesView.as_view(), name='smart-add-categories'),
    path('smart-add/products/<int:category_id>/', SmartAddProductsView.as_view(), name='smart-add-products'),
    path('smart-add/bulk-add/', SmartAddBulkAddView.as_view(), name='smart-add-bulk'),

]