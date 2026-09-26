import logging
from io import BytesIO
from PIL import Image

from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.files.base import ContentFile

from .models import Project, About, MainCertificate, Article

logger = logging.getLogger(__name__)

def optimize_image(instance):
    """
    Compresses and converts uploaded images to WebP format for optimal performance.
    Skips processing if the image hasn't changed.
    """
    if not instance.image:
        return

    # If this is an existing object, check if the image has actually changed
    if instance.pk:
        try:
            old_instance = instance.__class__.objects.get(pk=instance.pk)
            # If the image field value hasn't changed, do nothing
            if old_instance.image == instance.image:
                return
        except instance.__class__.DoesNotExist:
            pass

    try:
        # Open the image using Pillow
        img = Image.open(instance.image)

        # Convert to RGB to ensure compatibility (especially for RGBA/P formats being saved as JPEG or WEBP)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Resize large images
        max_size = (1920, 1080)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)

        # Save to a BytesIO object
        output = BytesIO()
        img.save(output, format='WEBP', quality=80, method=6)
        output.seek(0)

        # Build new filename
        original_name = str(instance.image.name)
        file_name = original_name.split('/')[-1]
        name_without_ext = file_name.rsplit('.', 1)[0]
        new_filename = f"{name_without_ext}.webp"

        # Update the instance's image field with the new compressed file
        instance.image.save(new_filename, ContentFile(output.read()), save=False)
        
    except Exception as e:
        logger.error(f"Image compression failed for {instance}: {e}")


@receiver(pre_save, sender=Project)
@receiver(pre_save, sender=About)
@receiver(pre_save, sender=MainCertificate)
@receiver(pre_save, sender=Article)
def image_compression_signal(sender, instance, **kwargs):
    optimize_image(instance)
