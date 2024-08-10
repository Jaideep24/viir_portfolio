# Generated by Django 3.2.25 on 2024-08-10 11:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('viir_folio', '0007_cv'),
    ]

    operations = [
        migrations.CreateModel(
            name='certificate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('url', models.URLField()),
            ],
        ),
    ]
