# Generated by Django 3.2.25 on 2024-07-28 19:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('viir_folio', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Projects',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('topic', models.CharField(max_length=100)),
                ('details', models.TextField()),
                ('category', models.CharField(max_length=100)),
                ('content', models.CharField(max_length=100)),
                ('image', models.ImageField(default='image.png', upload_to='')),
            ],
        ),
    ]
