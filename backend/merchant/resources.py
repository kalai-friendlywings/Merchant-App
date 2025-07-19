import requests
from django.core.files.base import ContentFile
from import_export import resources
from .models import MasterProduct

class MasterProductResource(resources.ModelResource):
    def before_import_row(self, row, row_number=None, **kwargs):
        image_url = row.get('image')
        if image_url and isinstance(image_url, str) and image_url.startswith('http'):
            try:
                response = requests.get(image_url)
                if response.status_code == 200:
                    file_name = image_url.split('/')[-1]
                    row['image'] = ContentFile(response.content, name=file_name)
            except Exception as e:
                print(f"Error downloading image at row {row_number}: {e}")
                row['image'] = None  # fallback to avoid import erroru

    class Meta:
        model = MasterProduct
        fields = ('id', 'name', 'brand', 'category', 'image')
