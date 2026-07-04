import os

settings_path = r'd:\viir_portfolio\viir_portfolio\settings.py'
with open(settings_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add django-compressor
if "'compressor'" not in content:
    content = content.replace("'django.contrib.staticfiles',", "'django.contrib.staticfiles',\n    'compressor',")

# Add compressor settings
if 'COMPRESS_ENABLED' not in content:
    compressor_settings = '''
# Django Compressor Settings
COMPRESS_ROOT = BASE_DIR / 'viir_folio' / 'static'
COMPRESS_ENABLED = True
COMPRESS_OFFLINE = False
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)
'''
    content += compressor_settings

# Add LocMemCache
if 'CACHES' not in content:
    cache_settings = '''
# Caching Configuration
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
'''
    content += cache_settings

with open(settings_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('settings.py updated with compressor and cache.')
