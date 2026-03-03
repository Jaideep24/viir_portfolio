# Generated manually - make Project.url optional (blank=True, null=True)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('viir_folio', '0029_alter_experience_options_remove_experience_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='url',
            field=models.URLField(blank=True, null=True),
        ),
    ]
