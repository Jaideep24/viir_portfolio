from django.db import models
from django.utils import timezone
from datetime import date
from multiselectfield import MultiSelectField
from phonenumber_field.modelfields import PhoneNumberField
from tinymce.models import HTMLField
from django.urls import reverse

# Create your models here.
class Education(models.Model):
    start_date = models.IntegerField(help_text="Start year (YYYY)")
    end_date = models.IntegerField(null=True, blank=True, help_text="End year (YYYY) — leave blank if ongoing")
    is_ongoing = models.BooleanField(default=False, help_text="Check if still pursuing this degree")
    title = models.CharField(max_length=100, help_text="Degree/Qualification title")
    institute_name = models.CharField(max_length=100, help_text="Name of institute/university")
    subject = models.CharField(max_length=100, help_text="Subject/Field of study")
    
    def __str__(self):
        end = "Pursuing" if self.is_ongoing else str(self.end_date)
        return f"{self.title} ({self.start_date} - {end})"
    
    class Meta:
        ordering = ['-start_date']  # Newest first by default
        verbose_name_plural = "Education"

class Experience(models.Model):
    start_date = models.DateField(db_index=True, help_text="Start date")
    end_date = models.DateField(null=True, blank=True, help_text="End date — leave blank if currently working here")
    is_ongoing = models.BooleanField(default=False, help_text="Check if currently working here")
    company_name = models.CharField(max_length=200, help_text="Company/Organization name")
    role = models.CharField(max_length=200, help_text="Job title/Role")
    bullet_points = models.TextField(blank=True, help_text="Work description (comma-separated bullet points)")
    tech_stack = models.CharField(max_length=500, blank=True, help_text="Tech stack (comma-separated)")
    
    def __str__(self):
        end = "Present" if self.is_ongoing else (self.end_date.strftime('%d/%m/%Y') if self.end_date else "No end date")
        return f"{self.role} at {self.company_name} ({self.start_date.strftime('%d/%m/%Y')} - {end})"
    
    def get_bullet_points(self):
        """Returns a list of non-empty bullet points from comma-separated string"""
        if self.bullet_points:
            return [point.strip() for point in self.bullet_points.split(',') if point.strip()]
        return []
    
    def get_tech_list(self):
        """Returns tech stack as a list"""
        if self.tech_stack:
            return [tech.strip() for tech in self.tech_stack.split(',') if tech.strip()]
        return []
    
    class Meta:
        ordering = ['-start_date']  # Newest first by default
        verbose_name_plural = "Experience"

class Project(models.Model):
    title=models.CharField(max_length=100)
    topic=models.CharField(max_length=100)
    date=models.DateField()
    client=models.CharField(max_length=100, blank=True, null=True)
    tech=models.CharField(max_length=100)
    url=models.URLField(blank=True, null=True)
    demo_video=models.URLField(blank=True, null=True)
    github_url=models.URLField(blank=True, null=True, help_text="GitHub repository URL")
    description=models.TextField(blank=True, help_text="Detailed project case study using the PAR method (Problem, Action, Results).")
    category=MultiSelectField(max_length=100, choices=(("webdev","Web Dev"),("appdev", "App Dev"), ("graphic","Graphics"),("mlai","ML/AI"),("iot","IoT")), default="webdev", max_choices=5)
    image=models.ImageField(default="image.png")
    def __str__(self):
        return self.title
    
    @property
    def categories_list(self):
        if isinstance(self.category, (list, tuple)):
            return self.category
        return [self.category] if self.category else []

    def get_absolute_url(self):
        return reverse('project_detail', args=[self.pk])

class About(models.Model):
    content=models.TextField()
    name=models.CharField(max_length=100)
    birthdate=models.DateField(default='2005-08-27')  # 27/08/2005
    language=models.CharField(max_length=100)
    phone_no=PhoneNumberField(blank=True,null=True, region='IN')
    email=models.EmailField()
    address=models.CharField(max_length=100)
    image=models.ImageField(default="image.png")
    
    @property
    def age(self):
        """Calculate age from birthdate"""
        today = date.today()
        return today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
    
    def __str__(self):
        return "About me"

class contact(models.Model):
    name=models.CharField(max_length=100)
    email=models.EmailField()
    number=PhoneNumberField(blank=True,null=True, region='IN')
    message=models.TextField()
    submitted_date=models.DateTimeField(auto_now_add=True, null=True, blank=True)
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        from django.utils.html import strip_tags
        if self.name:
            self.name = strip_tags(self.name)
        if self.email:
            self.email = strip_tags(self.email)
        if self.message:
            self.message = strip_tags(self.message)
        super().save(*args, **kwargs)

class Skill(models.Model):
    language=models.CharField(max_length=100)
    percentage=models.PositiveIntegerField()
    def __str__(self):
        return self.language

class cv(models.Model):
    pdf=models.FileField()

    def __str__(self):
        return f"CV #{self.pk}"

class certificate(models.Model):
    title=models.CharField(max_length=100)
    url=models.URLField()
    date=models.DateField()
    platform=models.CharField(max_length=100)
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
    # unique=True enforces DB-level deduplication; view also checks before saving
    email=models.EmailField(unique=True)
    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        from django.utils.html import strip_tags
        if self.email:
            self.email = strip_tags(self.email)
        super().save(*args, **kwargs)

class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    content = HTMLField()
    date = models.DateField(db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(default="default-blog-image.png")
    likes = models.IntegerField(blank=True, null=True, default=0)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('detail_blog', args=[self.slug])

    def save(self, *args, **kwargs):
        from django.utils.text import slugify
        from .utils import sanitize_html
        from django.utils.html import strip_tags
        if self.title:
            self.title = strip_tags(self.title)
        if self.content:
            self.content = sanitize_html(self.content)
        # Auto-generate slug from title if not provided
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class Comment(models.Model):
    name = models.TextField(blank=False, default=" ")
    comment = models.TextField()
    date = models.DateField(auto_now_add=True)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        from django.utils.html import strip_tags
        if self.name:
            self.name = strip_tags(self.name)
        if self.comment:
            self.comment = strip_tags(self.comment)
        super().save(*args, **kwargs)

class Logger(models.Model):
    user_name = models.CharField(max_length=25)
    # max_length=300 to safely accommodate Argon2/bcrypt hashes (pbkdf2_sha256 ~77 chars, argon2 ~97+ chars)
    password = models.CharField(max_length=300)

class Publication(models.Model):
    title = models.CharField(max_length=199)
    authors = models.CharField(max_length=300)
    date = models.DateField()
    place = models.CharField(max_length=300)
    url = models.URLField()
    def __str__(self):
        return self.title

    @property
    def authors_list(self):
        if self.authors:
            return [author.strip() for author in self.authors.split(',') if author.strip()]
        return []