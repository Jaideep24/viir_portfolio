from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db import models
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from tinymce.models import HTMLField

# Create your models here.
class Education(models.Model):
    date=models.CharField(max_length=100)
    title=models.CharField(max_length=100)
    rank=models.CharField(max_length=100)
    subject=models.CharField(max_length=100)
    def __str__(self):
        return self.title

class Experience(models.Model):
    date=models.CharField(max_length=100)
    title=models.CharField(max_length=100)
    rank=models.CharField(max_length=100)
    subject=models.CharField(max_length=100)
    def __str__(self):
        return self.title

class Skills(models.Model):
    title=models.CharField(max_length=100)
    front_content=models.CharField(max_length=100)
    back_content=models.CharField(max_length=100)
    icon=models.CharField(max_length=1000000)
    def __str__(self):
        return self.title

class Projects(models.Model):
    title=models.CharField(max_length=100)
    topic=models.CharField(max_length=100)
    date=models.DateField()
    client=models.CharField(max_length=100)
    tech=models.CharField(max_length=100)
    type=models.CharField(max_length=100)
    url=models.URLField()
    category=models.CharField(max_length=100)
    content=models.CharField(max_length=100)
    image=models.ImageField(default="image.png")
    def __str__(self):
        return self.title

class About(models.Model):
    content=models.TextField()
    name=models.CharField(max_length=100)
    age=models.PositiveIntegerField()
    language=models.CharField(max_length=100)
    phone_no=PhoneNumberField(blank=True,null=True, region='IN')
    email=models.EmailField()
    address=models.CharField(max_length=100)
    image=models.ImageField(default="image.png")
    def __str__(self):
        return "About me"

class contact(models.Model):
    name=models.CharField(max_length=100)
    email=models.EmailField()
    number=PhoneNumberField(blank=True,null=True, region='IN')
    message=models.TextField()
    def __str__(self):
        return self.name

class Languages(models.Model):
    language=models.CharField(max_length=100)
    percentage=models.PositiveIntegerField()
    def __str__(self):
        return self.language

class cv(models.Model):
    pdf=models.FileField()

class certificate(models.Model):
    title=models.CharField(max_length=100)
    url=models.URLField()
    date=models.DateField()
    platorm=models.CharField(max_length=100)
    criteria=models.CharField(max_length=100)
    show=models.BooleanField(default=False)
    def __str__(self):
        return self.title

class maincertificate(models.Model):
    title=models.CharField(max_length=100)
    image=models.ImageField(default="image.png")    
    def __str__(self):
        return self.title

class subscriber(models.Model):
    email=models.EmailField()
    def __str__(self):
        return self.email

class Article(models.Model):
    title = models.CharField(max_length=255)
    content = HTMLField()
    date = models.DateField()
    image=models.ImageField( default="default-ui-image-placeholder-wireframes-600nw-1037719192 (1).png")
    likes=models.IntegerField(blank=True, null=True, default=0)

    def __str__(self):
        return self.title
class Comment(models.Model):
    name=models.TextField(blank=False,default=" ")
    comment=models.TextField()
    article=models.ForeignKey(Article,on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class Logger(models.Model):
    user_name=models.CharField(max_length=25)
    password=models.CharField(max_length=100)