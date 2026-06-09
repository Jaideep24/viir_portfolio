from django.db import migrations

def migrate_loggers_to_users(apps, schema_editor):
    Logger = apps.get_model('viir_folio', 'Logger')
    User = apps.get_model('auth', 'User')
    
    for logger_obj in Logger.objects.all():
        username = logger_obj.user_name
        password_hash = logger_obj.password
        
        # Avoid creating duplicates if the user already exists in Auth User table
        if not User.objects.filter(username=username).exists():
            # Create a user with staff and superuser permissions so they can manage
            # both CMS posts and access the Django admin portal.
            user = User(
                username=username,
                password=password_hash,
                is_staff=True,
                is_superuser=True
            )
            user.save()

def reverse_migrate_loggers_to_users(apps, schema_editor):
    Logger = apps.get_model('viir_folio', 'Logger')
    User = apps.get_model('auth', 'User')
    
    for logger_obj in Logger.objects.all():
        username = logger_obj.user_name
        User.objects.filter(username=username).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('viir_folio', '0038_rename_platorm_certificate_platform_and_more'),
        ('auth', '0012_alter_user_first_name_max_length'), # Ensure auth models are loaded
    ]

    operations = [
        migrations.RunPython(migrate_loggers_to_users, reverse_migrate_loggers_to_users),
    ]
