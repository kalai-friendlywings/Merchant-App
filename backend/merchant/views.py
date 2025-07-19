from rest_framework import generics, status, permissions, viewsets, filters, parsers
from rest_framework.decorators import api_view, permission_classes, action 
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated , IsAdminUser
from django.contrib.auth import authenticate
from django.core.files.base import ContentFile
# import pandas as pd
from django.core.exceptions import ValidationError
from .models import (Merchant, MerchantProfile, Product, MasterCategory, MasterProduct , SmartAddSelection, 
            PendingProduct, Notification )
from .serializers import (
MerchantProfileImageSerializer,
MerchantProfileSerializer,
MerchantRegisterSerializer,
MerchantSerializer,
MerchantDetailsSerializer,
MerchantLoginSerializer,
ProductSerializer,
MasterProductSerializer,
ProductCreateFromMasterSerializer,
MasterCategorySerializer,
SmartAddCategorySerializer,
SmartAddProductSerializer,
BulkSmartAddSerializer,
PendingProductSerializer, # Added new serializer
AdminPendingProductApproveSerializer, # Added new serializer
NotificationSerializer # Added new serializer
)
import logging

logger = logging.getLogger(__name__)

class MerchantRegisterView(generics.CreateAPIView):
    serializer_class = MerchantRegisterSerializer  # <-- FIXED HERE
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Merchant registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'mobile_no': user.mobile_no
            }
        }, status=status.HTTP_201_CREATED)


class MerchantLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MerchantLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name
            }
        }, status=status.HTTP_200_OK)


class MerchantOnboardingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = MerchantProfile.objects.get(merchant=request.user)
            onboarded = profile.is_onboarded
        except MerchantProfile.DoesNotExist:
            onboarded = False

        return Response({
            "is_onboarded": onboarded,
            "full_name": request.user.full_name,
            "email": request.user.email
        }, status=status.HTTP_200_OK)

class MerchantProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = MerchantProfile.objects.get(merchant=request.user)
            serializer = MerchantDetailsSerializer(profile)
            return Response(serializer.data)
        except MerchantProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            profile = MerchantProfile.objects.get(merchant=request.user)
            serializer = MerchantDetailsSerializer(profile, data=request.data)
        except MerchantProfile.DoesNotExist:
            serializer = MerchantDetailsSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save(merchant=request.user, is_onboarded=True)
        return Response({'message': 'Profile saved successfully', 'data': serializer.data},
                        status=status.HTTP_201_CREATED)

    def patch(self, request):
        try:
            profile = MerchantProfile.objects.get(merchant=request.user)
        except MerchantProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = MerchantDetailsSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Profile updated successfully', 'data': serializer.data})

class MerchantProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @action(detail=False, methods=['get', 'patch'], url_path='images')
    def images(self, request):
        try:
            profile = MerchantProfile.objects.get(merchant=request.user)
        except MerchantProfile.DoesNotExist:
            return Response({'error': 'Complete onboarding first'}, status=404)

        if request.method == 'GET':
            serializer = MerchantProfileImageSerializer(profile, context={'request': request})
            return Response(serializer.data)

        elif request.method == 'PATCH':
            allowed_fields = {'profile_image', 'banner_image'}
            for field in request.data:
                if field not in allowed_fields:
                    return Response({'error': f'Cannot update field "{field}" here.'}, status=400)

            serializer = MerchantProfileImageSerializer(
                profile, data=request.data, partial=True, context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class CurrentMerchantView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MerchantSerializer(request.user)
        return Response(serializer.data)

# class ProductUploadView(APIView):
#     parser_classes = [parsers.MultiPartParser]
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         excel_file = request.FILES.get('file')
#         if not excel_file:
#             return Response({'error': 'No file uploaded'}, status=400)

#         try:
#             df = pd.read_excel(excel_file)
#         except Exception as e:
#             return Response({'error': f'Invalid Excel file: {str(e)}'}, status=400)

#         created_products = []

#         for _, row in df.iterrows():
#             category_name = row.get('category', '').strip()
#             category, _ = Category.objects.get_or_create(name=category_name)

#             product = Product.objects.create(
#                 merchant=request.user,
#                 name=row.get('name', ''),
#                 stock=row.get('stock', 0),
#                 original_price=row.get('original_price', 0),
#                 discount_price=row.get('discount_price', 0),
#                 category=category
#             )
#             created_products.append(product.id)

#         return Response({
#             'status': 'success',
#             'created_count': len(created_products),
#             'product_ids': created_products
#         }, status=201)

class MasterProductByCategory(generics.ListAPIView):
    serializer_class = MasterProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MasterProduct.objects.filter(category_id=self.kwargs['category_id']).select_related('category')

class MasterCategoryList(generics.ListAPIView):
    serializer_class = MasterCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        business_category = self.request.query_params.get('business_category')
        if business_category:
            return MasterCategory.objects.filter(business_category__iexact=business_category)
        return MasterCategory.objects.none()

class MasterProductListBySubcategory(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_id):
        products = MasterProduct.objects.filter(category_id=category_id)
        serializer = MasterProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=200)


class ProductCreateFromMasterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        master_ids = request.data.get('master_product_ids', [])
        if not master_ids:
            return Response({"error": "No product IDs provided"}, status=400)

        try:
            business_category = request.user.profile.category
        except MerchantProfile.DoesNotExist:
            return Response(
                {"error": "Complete business onboarding first"},
                status=status.HTTP_400_BAD_REQUEST
            )

        added_products = []
        for mp_id in master_ids:
            try:
                mp = MasterProduct.objects.get(id=mp_id)
                # Verify category matches merchant's business
                if mp.category.business_category != business_category:
                    continue
            except MasterProduct.DoesNotExist:
                continue

            # Create or get existing product
            product, created = Product.objects.get_or_create(
                merchant=request.user,
                master_product=mp,
                defaults={
                    'name': mp.name,
                    'description': mp.description or "",  # Ensure description is copied
                    'category': mp.category,
                    'stock': 0,
                    'original_price': 0,
                    'discount_price': 0
                }
            )
            
            if created:
                added_products.append({
                    'id': product.id,
                    'name': product.name,
                    'category': product.category.name
                })
                
                # Copy image if exists - UPDATED METHOD
                if mp.image:
                    try:
                        # Create new file instance
                        from django.core.files.base import ContentFile
                        from io import BytesIO
                        
                        # Read original image
                        img_data = mp.image.read()
                        
                        # Create new file with same content but different path
                        product.image.save(
                            mp.image.name,
                            ContentFile(img_data),
                            save=True
                        )
                    except Exception as e:
                        logger.error(f"Failed to copy image for product {mp.id}: {str(e)}")
                        # Continue without image if copy fails
                        product.save()

        return Response({
            "status": "success",
            "added_count": len(added_products),
            "products": added_products
        })


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser , parsers.JSONParser] # Allow file uploads

    def get_queryset(self):
        return Product.objects.filter(merchant=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # Differentiate between adding from master product and adding a new, unapproved product
        master_product_id = request.data.get('master_product_id')

        if master_product_id:
            # If master_product_id is provided, use the ProductCreateFromMasterSerializer flow
            serializer = ProductCreateFromMasterSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            product = serializer.save()
            return Response(ProductSerializer(product, context={'request': request}).data, status=status.HTTP_201_CREATED)
        else:
            # If no master_product_id, it's a new, unapproved product
            serializer = PendingProductSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            pending_product = serializer.save(merchant=request.user) # Assign current merchant

            # Admin Notification (e.g., send email or create internal notification)
            logger.info(f"New pending product submitted by {request.user.email}: {pending_product.name}")

            return Response({
                'message': 'Product submitted for review. It will appear in your inventory after admin approval.',
                'product_id': pending_product.id
            }, status=status.HTTP_202_ACCEPTED) # 202 Accepted as it's not yet fully created


# class AdminProductViewSet(viewsets.ReadOnlyModelViewSet):
#     serializer_class = ProductSerializer
#     permission_classes = [permissions.IsAdminUser]

#     def get_queryset(self):
#         queryset = Product.objects.all()
        
#         # Filter by status if provided
#         status_param = self.request.query_params.get('status', 'pending')
#         if status_param:
#             queryset = queryset.filter(status=status_param)
            
#         return queryset.order_by('-created_at')

class MasterProductUploadView(APIView):
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        excel_file = request.FILES.get('file')
        if not excel_file:
            return Response({'error': 'No file uploaded'}, status=400)

        try:
            df = pd.read_excel(excel_file)
        except Exception as e:
            return Response({'error': f'Invalid Excel file: {str(e)}'}, status=400)

        created_master_products = []

        for _, row in df.iterrows():
            category_name = row.get('category', '').strip()
            category, _ = MasterCategory.objects.get_or_create(name=category_name)

            master_product = MasterProduct.objects.create(
                name=row.get('name', ''),
                brand=row.get('brand', ''),
                category=category
            )
            created_master_products.append(master_product.id)

        return Response({
            'status': 'success',
            'created_count': len(created_master_products),
            'master_product_ids': created_master_products
        }, status=201)

# 🔍 List all master products for a given subcategory
class MasterProductListBySubcategory(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_id):
        products = MasterProduct.objects.filter(category_id=category_id)
        serializer = MasterProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=200)


# ✅ Add selected master products to merchant’s store
class SmartAddCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            business_category = request.user.profile.category
            categories = MasterCategory.objects.filter(
                business_category=business_category
            )
            serializer = SmartAddCategorySerializer(categories, many=True)
            return Response(serializer.data)
        except AttributeError:
            return Response(
                {"error": "Complete business onboarding first"},
                status=status.HTTP_400_BAD_REQUEST
            )

class SmartAddProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_id):
        # Verify category belongs to merchant's business
        try:
            business_category = request.user.profile.category
            category = MasterCategory.objects.get(
                id=category_id,
                business_category=business_category
            )
        except MasterCategory.DoesNotExist:
            return Response(
                {"error": "Invalid category"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get products not already added by merchant
        products = MasterProduct.objects.filter(
            category=category
        ).exclude(
            smartaddselection__merchant=request.user
        )
        serializer = SmartAddProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

class SmartAddBulkAddView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = BulkSmartAddSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        category = serializer.validated_data['category_id']
        product_ids = serializer.validated_data['product_ids']
        merchant = request.user

        # Get master products
        master_products = MasterProduct.objects.filter(
            id__in=product_ids,
            category=category
        ).select_related('category')

        # Create SmartAddSelection records
        selections = [
            SmartAddSelection(merchant=merchant, master_product=mp)
            for mp in master_products
        ]
        SmartAddSelection.objects.bulk_create(selections)

        # Create Product records one by one to handle images properly
        created_products = []
        for mp in master_products:
            product = Product(
                merchant=merchant,
                master_product=mp,
                name=mp.name,
                description=mp.description or '',
                category=mp.category,
                stock=0,
                original_price=0,
                discount_price=0
            )
            product.save()  # Save first to get an ID
            
            # Copy image if exists
            if mp.image:
                try:
                    # Create new file name to avoid conflicts
                    new_filename = f"merchant_{merchant.id}_product_{product.id}_{mp.image.name.split('/')[-1]}"
                    product.image.save(
                        new_filename,
                        ContentFile(mp.image.read()),
                        save=True
                    )
                except Exception as e:
                    logger.error(f"Failed to copy image for product {product.id}: {str(e)}")
                    # Continue even if image fails to copy
            
            created_products.append(product)

        return Response({
            "status": "success",
            "added_count": len(created_products)
        }, status=status.HTTP_201_CREATED)
        
class SmartAddSelectedProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        selections = SmartAddSelection.objects.filter(
            merchant=request.user
        ).select_related('master_product')
        serializer = SmartAddSelectionSerializer(selections, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        product_ids = request.data.get('product_ids', [])
        
        if not product_ids:
            return Response({"error": "No products selected"}, status=400)

        # Create selections
        selections = [
            SmartAddSelection(merchant=request.user, master_product_id=pid)
            for pid in product_ids
        ]
        SmartAddSelection.objects.bulk_create(selections, ignore_conflicts=True)

        # Create merchant products
        master_products = MasterProduct.objects.filter(id__in=product_ids)
        merchant_products = [
            Product(
                merchant=request.user,
                master_product=mp,
                name=mp.name,
                description=mp.description,
                category=mp.category,
                stock=0,
                original_price=0,
                discount_price=0
            )
            for mp in master_products
        ]
        created_products = Product.objects.bulk_create(merchant_products)

        # Copy images
        for product in created_products:
            if product.master_product.image:
                product.image.save(
                    product.master_product.image.name,
                    ContentFile(product.master_product.image.read()),
                    save=True
                )

        return Response({
            "status": "success",
            "added_count": len(created_products)
        })

class SmartAddRemoveProductView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        deleted, _ = SmartAddSelection.objects.filter(
            merchant=request.user,
            master_product_id=product_id
        ).delete()
        return Response({'removed': deleted > 0})

# NEW: Pending Products & Notifications

# ---------------------- NEW: PendingProduct Views (Admin Only) -------------------
class PendingProductViewSet(viewsets.ModelViewSet):
    queryset = PendingProduct.objects.filter(is_approved=False).order_by('-created_at')
    permission_classes = [IsAdminUser]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_serializer_class(self):
        if self.action == 'approve':
            return AdminPendingProductApproveSerializer
        return PendingProductSerializer

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Operation not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def update(self, request, *args, **kwargs):
        if 'is_approved' in request.data and request.data['is_approved'] and 'category' not in request.data:
            return Response({"category": "Category must be selected when marking as approved."}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)


    @action(detail=True, methods=['post'])
    @transaction.atomic
    def approve(self, request, pk=None):
        logger.info(f"Attempting to approve pending product with ID: {pk}")
        try:
            pending_product = self.get_object()
            if pending_product.is_approved:
                logger.warning(f"Pending product {pk} already approved. Returning 400.")
                return Response({"detail": "Product already approved."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = self.get_serializer(pending_product, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            if not serializer.validated_data.get('category'):
                logger.error(f"Approval failed for pending product {pk}: Category is missing.")
                return Response({"category": "Category must be selected for approval."}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save(is_approved=True) 
            logger.info(f"Pending product {pk} marked as approved in serializer. Category set to: {pending_product.category.name}")

            # Create actual Product instance
            try:
                product = Product.objects.create(
                    merchant=pending_product.merchant,
                    name=pending_product.name,
                    description=pending_product.description,
                    stock=pending_product.stock,
                    original_price=pending_product.original_price,
                    discount_price=pending_product.discount_price,
                    category=pending_product.category,
                )
                logger.info(f"New Product instance created. ID: {product.id}, Name: {product.name}")
            except Exception as e:
                logger.error(f"Failed to create actual Product instance for pending product {pk}: {str(e)}")
                raise # Re-raise to trigger transaction rollback if product creation failed

            # Copy image from pending product to new product
            if pending_product.image:
                try:
                    with pending_product.image.open('rb') as f:
                        product.image.save(
                            os.path.basename(pending_product.image.name),
                            ContentFile(f.read()),
                            save=True
                        )
                    logger.info(f"Image successfully copied for product {product.id}.")
                    # After successful copy, delete the image from pending_products storage
                    pending_product.image.delete(save=False)
                    logger.info(f"Pending product image deleted for {pending_product.id}.")
                except Exception as e:
                    logger.error(f"Failed to copy or delete image from pending product {pending_product.id} to approved product {product.id}: {str(e)}")
                    # Continue even if image copy fails, but log the error
            else:
                logger.info(f"No image found for pending product {pending_product.id} to copy.")


            # Create notification for merchant
            try:
                Notification.objects.create(
                    recipient=product.merchant,
                    message=f"Your new product '{product.name}' has been approved under category: '{product.category.name if product.category else 'Uncategorized'}'.",
                    product=product
                )
                logger.info(f"Notification created for merchant {product.merchant.email}.")
            except Exception as e:
                logger.error(f"Failed to create notification for merchant {product.merchant.email} for product {product.id}: {str(e)}")
                # Continue even if notification fails, but log the error

            # Delete the pending product record
            try:
                pending_product.delete()
                logger.info(f"Pending product {pk} successfully deleted after approval.")
            except Exception as e:
                logger.error(f"Failed to delete pending product {pk} after approval: {str(e)}")


            return Response({
                "message": "Product approved and moved to merchant inventory.",
                "approved_product_id": product.id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"An unexpected error occurred during approval process for pending product {pk}: {str(e)}")
            return Response({"detail": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        logger.info(f"Attempting to reject pending product with ID: {pk}")
        try:
            pending_product = self.get_object()
            if pending_product.is_approved:
                logger.warning(f"Pending product {pk} already approved. Cannot reject.")
                return Response({"detail": "Product already approved. Cannot reject."}, status=status.HTTP_400_BAD_REQUEST)

            admin_notes = request.data.get('admin_notes', 'No specific reason provided.')
            pending_product.admin_notes = admin_notes
            pending_product.save()
            logger.info(f"Pending product {pk} rejected. Admin notes: {admin_notes}")

            try:
                Notification.objects.create(
                    recipient=pending_product.merchant,
                    message=f"Your product '{pending_product.name}' was reviewed and rejected. Admin notes: {admin_notes}",
                )
                logger.info(f"Rejection notification created for merchant {pending_product.merchant.email}.")
            except Exception as e:
                logger.error(f"Failed to create rejection notification for merchant {pending_product.merchant.email} for product {pending_product.id}: {str(e)}")

            if pending_product.image:
                try:
                    pending_product.image.delete(save=False)
                    logger.info(f"Pending product image deleted upon rejection for {pending_product.id}.")
                except Exception as e:
                    logger.error(f"Failed to delete pending product image {pending_product.image.name} upon rejection: {str(e)}")

            try:
                pending_product.delete()
                logger.info(f"Pending product {pk} successfully deleted after rejection.")
            except Exception as e:
                logger.error(f"Failed to delete pending product {pk} after rejection: {str(e)}")


            return Response({
                "message": "Product rejected and removed from pending list.",
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"An unexpected error occurred during rejection process for pending product {pk}: {str(e)}")
            return Response({"detail": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found or not authorized."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)
