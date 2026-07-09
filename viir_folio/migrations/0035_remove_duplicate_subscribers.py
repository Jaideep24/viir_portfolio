# Generated migration to remove duplicate subscribers and add unique constraint

from django.db import migrations, models


def remove_duplicate_subscribers(apps, schema_editor):
    """Remove duplicate email entries, keeping only the first one"""
    subscriber = apps.get_model("viir_folio", "subscriber")

    # Get all unique emails
    unique_emails = subscriber.objects.values("email").distinct()

    for email_obj in unique_emails:
        email = email_obj["email"]
        # Get all records with this email
        duplicates = subscriber.objects.filter(email=email).order_by("id")

        # If more than one record exists, delete all but the first
        if duplicates.count() > 1:
            # Keep the first one, delete the rest
            duplicates_to_delete = duplicates[1:]
            for dup in duplicates_to_delete:
                dup.delete()


def reverse_remove_duplicates(apps, schema_editor):
    """Reverse function (no-op for this migration)"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("viir_folio", "0034_article_slug"),
    ]

    operations = [
        migrations.RunPython(remove_duplicate_subscribers, reverse_remove_duplicates),
        migrations.AlterField(
            model_name="subscriber",
            name="email",
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]
