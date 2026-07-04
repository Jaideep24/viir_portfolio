import os
import django
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'viir_portfolio.settings')
django.setup()

from viir_folio.models import Project, About, maincertificate, Article
from django.conf import settings

def rename_image(instance, field_name, new_name_base):
    img_field = getattr(instance, field_name)
    if not img_field or not img_field.name:
        return

    old_path = os.path.join(settings.MEDIA_ROOT, img_field.name)
    if not os.path.exists(old_path) or 'Screenshot' not in img_field.name and 'image' not in img_field.name:
        # Skip if already renamed or doesn't exist
        return
        
    ext = os.path.splitext(old_path)[1]
    new_filename = f"{new_name_base}{ext}"
    new_path = os.path.join(settings.MEDIA_ROOT, new_filename)
    
    # Check if we are not renaming to the same thing
    if old_path != new_path:
        try:
            shutil.copy2(old_path, new_path)
            setattr(instance, field_name, new_filename)
            instance.save()
            print(f"Renamed {img_field.name} to {new_filename}")
        except Exception as e:
            print(f"Error renaming {old_path}: {e}")

# Rename About image
try:
    about = About.objects.first()
    if about:
        rename_image(about, 'image', 'viir-phuria-profile')
except Exception as e:
    print(e)

# Rename Project images
for p in Project.objects.all():
    safe_title = p.title.replace(' ', '-').lower()
    rename_image(p, 'image', f"project-{safe_title}")

# Rename Certificates
for idx, c in enumerate(maincertificate.objects.all()):
    rename_image(c, 'image', f"certificate-{idx+1}")

print("Image renaming process completed.")
