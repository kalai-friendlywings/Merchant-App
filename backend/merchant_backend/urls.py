from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static  # ✅ Required for media files

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/merchant/', include('merchant.urls')),  # ✅ Only merchant URLs for now
]

# ✅ Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
