from django.contrib import admin
from django.utils.html import format_html
import pandas as pd
from zipfile import ZipFile
from django.core.files.base import ContentFile
import io
import os
from django.db import transaction
from django.contrib import messages
from .models import (
    MasterCategory, MasterProduct, MasterProductUpload, Merchant, Product,
    PendingProduct, Notification # Added new models
)
import logging

logger = logging.getLogger(__name__)

@admin.register(MasterProductUpload)
class MasterProductUploadAdmin(admin.ModelAdmin):
    list_display = ['uploaded_at']
    actions = ['process_upload']

    def save_model(self, request, obj, form, change):
        """Only save the upload instance, processing happens via action"""
        super().save_model(request, obj, form, change)

    def process_upload(self, request, queryset):
        """Custom admin action to process uploads"""
        for upload in queryset:
            try:
                self._process_upload_file(upload)
                self.message_user(request, f"Successfully processed {upload.excel_file.name}")
            except Exception as e:
                self.message_user(request, f"Error processing {upload.excel_file.name}: {str(e)}", level='error')
    process_upload.short_description = "Process selected uploads"

    def _process_upload_file(self, upload):
        excel_file = upload.excel_file
        zip_file = upload.image_zip

        # Read Excel file
        try:
            df = pd.read_excel(excel_file)
            required_columns = {'name', 'category', 'business_category', 'image_name'}
            if not required_columns.issubset(df.columns):
                raise ValueError(f"Excel missing required columns: {required_columns - set(df.columns)}")
        except Exception as e:
            raise ValueError(f"Invalid Excel file: {str(e)}")

        # Process ZIP file
        zip_data = zip_file.read()
        zip_io = io.BytesIO(zip_data)

        with ZipFile(zip_io, 'r') as archive:
            image_files = {name: archive.read(name) for name in archive.namelist()}

        # Process rows
        success_count = 0
        for index, row in df.iterrows():
            try:
                name = str(row['name']).strip()
                brand = str(row.get('brand', '')).strip()
                description = str(row.get('description', '')).strip()
                category_name = str(row['category']).strip()
                business_category = str(row['business_category']).strip()
                image_name = str(row['image_name']).strip()

                # Validate business category
                if business_category not in dict(Merchant.CATEGORY_CHOICES).keys():
                    print(f"⚠️ Invalid business category: {business_category} for product {name}")
                    continue

                # Get or create category
                category_obj, _ = MasterCategory.objects.get_or_create(
                    name=category_name,
                    defaults={'business_category': business_category}
                )

                # Check for duplicates
                if MasterProduct.objects.filter(name=name, brand=brand, category=category_obj).exists():
                    print(f"⏩ Skipping duplicate: {name} ({brand})")
                    continue

                # Create product
                product = MasterProduct(
                    name=name,
                    brand=brand if brand else None,
                    description=description if description else None,
                    category=category_obj
                )

                # Handle image
                if image_name in image_files:
                    product.image.save(
                        image_name,
                        ContentFile(image_files[image_name]),
                        save=False
                    )
                else:
                    print(f"⚠️ Image not found: {image_name} for product {name}")

                product.save()
                success_count += 1
                print(f"✅ Saved: {product.name}")

            except Exception as e:
                print(f"❌ Error processing row {index}: {str(e)}")
                continue

        print(f"Processed {success_count}/{len(df)} products successfully")


@admin.register(MasterCategory)
class MasterCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'business_category']
    search_fields = ['name', 'business_category']


@admin.register(MasterProduct)
class MasterProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'get_category', 'get_business_category', 'image_preview']
    search_fields = ['name', 'brand', 'category__name']
    list_filter = ['category__business_category', 'category']
    readonly_fields = ['image_preview']

    def get_category(self, obj):
        return obj.category.name if obj.category else '-'
    get_category.short_description = 'Category'

    def get_business_category(self, obj):
        return obj.category.business_category if obj.category else '-'
    get_business_category.short_description = 'Business Category'

    def image_preview(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "-"
    image_preview.short_description = 'Preview'
    image_preview.allow_tags = True
# ---------------------- NEW: PendingProduct Admin -------------------
@admin.register(PendingProduct)
class PendingProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'merchant_email', 'is_approved', 'category_name', 'created_at', 'admin_notes_short', 'product_image_preview']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['name', 'merchant__email', 'merchant__full_name', 'admin_notes']
    # Removed is_approved from readonly_fields to allow admin to change it directly on the form
    readonly_fields = ['product_image_preview', 'created_at', 'updated_at', 'merchant', 'name', 'description', 'stock', 'original_price', 'discount_price']
    actions = ['approve_selected_products', 'reject_selected_products']
    fieldsets = (
        (None, {
            'fields': (('name', 'merchant'), 'description', ('stock', 'original_price', 'discount_price'), 'product_image_preview', )
        }),
        ('Admin Review', {
            'fields': ('is_approved', 'category', 'admin_notes',),
            'description': 'Set category and approve/reject the product.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        })
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('merchant', 'category')

    def merchant_email(self, obj):
        return obj.merchant.email
    merchant_email.short_description = 'Merchant Email'

    def category_name(self, obj):
        return obj.category.name if obj.category else 'N/A'
    category_name.short_description = 'Category (Admin Set)'

    def admin_notes_short(self, obj):
        return (obj.admin_notes[:75] + '...') if len(obj.admin_notes) > 75 else obj.admin_notes
    admin_notes_short.short_description = 'Admin Notes'

    def product_image_preview(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return format_html('<img src="{}" width="100" height="100" style="border-radius: 8px; object-fit: contain; background-color: #f0f0f0;" />', obj.image.url)
        return format_html('<span style="color: #999;">No Image</span>')
    product_image_preview.short_description = 'Image Preview'
    product_image_preview.allow_tags = True

    def save_model(self, request, obj, form, change):
        # Get the original state of 'is_approved' before saving changes, only if it's an existing object being changed
        # This is crucial to detect the transition from unapproved to approved
        old_is_approved = False
        if obj.pk: # If the object already exists in the database
            try:
                old_obj = PendingProduct.objects.get(pk=obj.pk)
                old_is_approved = old_obj.is_approved
            except PendingProduct.DoesNotExist:
                pass # Should not happen, but good to handle

        # Save the PendingProduct instance first, applying all form changes (including category and is_approved)
        super().save_model(request, obj, form, change)
        logger.info(f"Admin saved PendingProduct ID {obj.id}. is_approved changed from {old_is_approved} to {obj.is_approved}")


        # --- Core Approval Logic (Triggered only when is_approved changes to True) ---
        if obj.is_approved and not old_is_approved: # Check if it just got approved
            if not obj.category:
                messages.error(request, f"Product '{obj.name}' cannot be approved: Category is not set. Please set a category and save again.")
                # We save again with is_approved=False to revert the change in DB
                obj.is_approved = False
                obj.save(update_fields=['is_approved']) 
                logger.error(f"Approval aborted for {obj.id}: Category not set. is_approved reset to False.")
                return # Stop processing this approval

            with transaction.atomic():
                try:
                    logger.info(f"Attempting to approve pending product (Admin Save) with ID: {obj.id}")
                    
                    # Create actual Product instance
                    product = Product.objects.create(
                        merchant=obj.merchant,
                        name=obj.name,
                        description=obj.description,
                        stock=obj.stock,
                        original_price=obj.original_price,
                        discount_price=obj.discount_price,
                        category=obj.category,
                    )
                    logger.info(f"New Product instance created. ID: {product.id}, Name: {product.name}")

                    # Copy image from pending product to new product
                    if obj.image:
                        try:
                            # Re-open the file from storage to read its content
                            with obj.image.open('rb') as f:
                                product.image.save(
                                    os.path.basename(obj.image.name),
                                    ContentFile(f.read()),
                                    save=True
                                )
                            logger.info(f"Image successfully copied for product {product.id}.")
                            # After successful copy, delete the image from pending_products storage
                            obj.image.delete(save=False)
                            logger.info(f"Pending product image deleted for {obj.id}.")
                        except Exception as e:
                            logger.error(f"Failed to copy or delete image from pending product {obj.id} to approved product {product.id}: {str(e)}")
                            messages.warning(request, f"Image for '{obj.name}' could not be copied. Product approved without image. Error: {str(e)}")
                    else:
                        logger.info(f"No image found for pending product {obj.id} to copy.")

                    # Create notification for merchant
                    try:
                        Notification.objects.create(
                            recipient=product.merchant,
                            message=f"Your new product '{product.name}' has been approved under category: '{product.category.name}'.",
                            product=product
                        )
                        logger.info(f"Notification created for merchant {product.merchant.email}.")
                        messages.success(request, f"Product '{obj.name}' approved and notification sent.")
                    except Exception as e:
                        logger.error(f"Failed to create notification for merchant {product.merchant.email} for product {product.id}: {str(e)}")
                        messages.warning(request, f"Product '{obj.name}' approved, but notification failed. Error: {str(e)}")

                    # Delete the pending product record ONLY AFTER all steps are successful
                    obj.delete()
                    logger.info(f"Pending product {obj.id} successfully deleted after approval.")

                except Exception as e:
                    # This will trigger a rollback due to @transaction.atomic
                    logger.exception(f"FATAL: Transaction rolled back during approval for pending product {obj.id}: {str(e)}")
                    messages.error(request, f"Failed to approve product '{obj.name}': An unexpected error occurred. Details logged.")
                    # Revert is_approved to False if transaction fails to allow re-attempt
                    obj.is_approved = False 
                    obj.save(update_fields=['is_approved']) 


    @admin.action(description="Approve selected pending products")
    def approve_selected_products(self, request, queryset):
        approved_count = 0
        for pending_product in queryset.filter(is_approved=False):
            if not pending_product.category:
                self.message_user(request, f"Product '{pending_product.name}' by {pending_product.merchant.email} cannot be approved: Category is not set. Please set a category manually.", level=messages.ERROR)
                continue
            
            with transaction.atomic():
                try:
                    logger.info(f"Admin action: Approving pending product ID: {pending_product.id}")
                    # Create actual Product instance
                    product = Product.objects.create(
                        merchant=pending_product.merchant,
                        name=pending_product.name,
                        description=pending_product.description,
                        stock=pending_product.stock,
                        original_price=pending_product.original_price,
                        discount_price=pending_product.discount_price,
                        category=pending_product.category, # Use the category set by admin
                    )
                    logger.info(f"Admin action: New Product instance created. ID: {product.id}")
                    
                    # Copy image from pending product to new product
                    if pending_product.image:
                        try:
                            with pending_product.image.open('rb') as f:
                                product.image.save(
                                    os.path.basename(pending_product.image.name),
                                    ContentFile(f.read()),
                                    save=True
                                )
                            logger.info(f"Admin action: Image copied for product {product.id}.")
                            pending_product.image.delete(save=False)
                            logger.info(f"Admin action: Pending product image deleted for {pending_product.id}.")
                        except Exception as e:
                            logger.error(f"Admin action: Failed to copy or delete image for {pending_product.id}: {str(e)}")
                            messages.warning(request, f"Image for '{pending_product.name}' could not be copied. Product approved without image. Error: {str(e)}")


                    # Create notification for merchant
                    try:
                        Notification.objects.create(
                            recipient=product.merchant,
                            message=f"Your new product '{product.name}' has been approved under category: '{product.category.name}'.",
                            product=product
                        )
                        logger.info(f"Admin action: Notification created for merchant {product.merchant.email}.")
                    except Exception as e:
                        logger.error(f"Admin action: Failed to create notification for merchant {product.merchant.email} for product {product.id}: {str(e)}")
                        messages.warning(request, f"Product '{pending_product.name}' approved, but notification failed. Error: {str(e)}")
                    
                    pending_product.delete()
                    logger.info(f"Admin action: Pending product {pending_product.id} successfully deleted.")
                    approved_count += 1
                except Exception as e:
                    logger.exception(f"Admin action: Error approving pending product {pending_product.id}: {str(e)}")
                    self.message_user(request, f"Failed to approve '{pending_product.name}' by {pending_product.merchant.email}: {str(e)}", level=messages.ERROR)
        
        if approved_count > 0:
            self.message_user(request, f"Successfully approved {approved_count} product(s).")
        else:
            self.message_user(request, "No products were approved.", level=messages.INFO)


    @admin.action(description="Reject selected pending products")
    def reject_selected_products(self, request, queryset):
        rejected_count = 0
        for pending_product in queryset.filter(is_approved=False):
            with transaction.atomic():
                try:
                    logger.info(f"Admin action: Rejecting pending product ID: {pending_product.id}")
                    # Create notification for merchant about rejection
                    Notification.objects.create(
                        recipient=pending_product.merchant,
                        message=f"Your product '{pending_product.name}' was reviewed and rejected. Please contact support for more details if needed.",
                    )
                    logger.info(f"Admin action: Rejection notification created for merchant {pending_product.merchant.email}.")
                    
                    # Delete pending product image from storage if exists
                    if pending_product.image:
                        try:
                            pending_product.image.delete(save=False)
                            logger.info(f"Admin action: Pending product image deleted upon rejection for {pending_product.id}.")
                        except Exception as e:
                            logger.error(f"Admin action: Failed to delete pending product image {pending_product.image.name} upon rejection: {str(e)}")

                    pending_product.delete()
                    logger.info(f"Admin action: Pending product {pending_product.id} successfully deleted after rejection.")
                    rejected_count += 1
                except Exception as e:
                    logger.exception(f"Admin action: Error rejecting pending product {pending_product.id}: {str(e)}")
                    self.message_user(request, f"Failed to reject '{pending_product.name}' by {pending_product.merchant.email}: {str(e)}", level=messages.ERROR)
        
        if rejected_count > 0:
            self.message_user(request, f"Successfully rejected {rejected_count} product(s).")
        else:
            self.message_user(request, "No products were rejected.", level=messages.INFO)


# ---------------------- NEW: Notification Admin -------------------
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'message_summary', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['recipient__email', 'message']
    readonly_fields = ['recipient', 'message', 'product', 'created_at']
    actions = ['mark_as_read', 'mark_as_unread']

    def message_summary(self, obj):
        return (obj.message[:100] + '...') if len(obj.message) > 100 else obj.message
    message_summary.short_description = 'Message'

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} notifications marked as read.")

    @admin.action(description="Mark selected notifications as unread")
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} notifications marked as unread.")