# Generated by Django 4.2.5 on 2024-09-13 13:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('viir_folio', '0014_alter_article_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projects',
            name='category',
            field=models.CharField(choices=[('web dev', 'web dev'), ('app dev', 'app dev'), ('graphics', 'graphics'), ('mlai', 'mlai'), ('iot', 'iot')], default='web dev', max_length=100),
        ),
    ]
