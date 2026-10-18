from django.apps import AppConfig


class ViirFolioConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "viir_folio"
    verbose_name = "Portfolio & Blog Management"

    def ready(self):
        import viir_folio.signals

        # Gracefully handle key rotation or signature mismatch in django-cryptography
        try:
            from django_cryptography.fields import EncryptedMixin
            from django.core.signing import BadSignature
            from cryptography.exceptions import InvalidSignature

            _orig_load = EncryptedMixin._load

            def _safe_load(self, value):
                try:
                    return _orig_load(self, value)
                except (BadSignature, InvalidSignature):
                    return "[Decryption Error: Key Mismatch]"

            EncryptedMixin._load = _safe_load
        except ImportError:
            pass
